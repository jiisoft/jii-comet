/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');


var NeatComet = require('neatcomet');

/**
 * @class Jii.comet.server.NeatServer
 * @extends Jii.base.Object
 * @implements NeatComet.api.ICometServer
 * @implements NeatComet.api.IOrmLoader
 */
Jii.defineClass('Jii.comet.server.NeatServer', /** @lends Jii.comet.server.NeatServer.prototype */{

    __extends: 'Jii.base.Object',

    __static: /** @lends Jii.comet.server.NeatServer */{

        ROUTE_PREFIX: 'profiles:'

    },

    /**
     * @type {string}
     * @deprecated
     */
    configFileName: null,

    /**
     * @type {object}
     */
    bindings: null,

    /**
     * @type {Jii.comet.server.Server}
     **/
    comet: null,

    /**
     * Callback function to be called when folder loaded from server.
     * @callback Jii.comet.server.NeatServer~dataLoadHandlerCallback
     * @param {object} params
     * @returns {Promise}
     */

    /**
     * @type {Jii.comet.server.NeatServer~dataLoadHandlerCallback}
     */
    dataLoadHandler: null,

    /**
     * @type {object|boolean}
     */
    hasDynamicAttributes: false,

    /**
     * @type {boolean}
     */
    listenModels: true,

    /**
     * Note: onOpenProfileCommand() and onCloseProfileCommand must be called from actions explicitly.
     * There's no way to subscribe for them in Jii.
     *
     * @type {NeatComet.api.ICometServerEvents}
     */
    _events: null,

    /**
     * @type {NeatComet.NeatCometServer}
     */
    engine: null,

    init: function () {
        this.__super();

        // Init transport
        this.comet = this.comet === null ?
            Jii.app.get('comet') :
            (
                this.comet instanceof Jii.base.Component ?
                    this.comet :
                    Jii.createObject(this.comet)
            );

        this.engine = new NeatComet.NeatCometServer();
        this.engine.setup({
            comet: this,
            ormLoader: this,
            configFileName: this.configFileName || this.bindings,
            externalDataLoader: this.dataLoadHandler
        });

        Jii.app.inlineActions['neat/open'] = this._actionOpenProfile.bind(this);
        Jii.app.inlineActions['neat/close'] = this._actionCloseProfile.bind(this);

        if (this.listenModels && Jii.base.ActiveRecord) {
            Jii.base.Event.on(Jii.base.ActiveRecord.className(), Jii.base.ActiveRecord.EVENT_AFTER_INSERT, this._onModelInsert.bind(this));
            Jii.base.Event.on(Jii.base.ActiveRecord.className(), Jii.base.ActiveRecord.EVENT_AFTER_UPDATE, this._onModelUpdate.bind(this));
            Jii.base.Event.on(Jii.base.ActiveRecord.className(), Jii.base.ActiveRecord.EVENT_AFTER_DELETE, this._onModelDelete.bind(this));
        }
    },

    /**
     * Allowed to expect that it will be called only once per ICometServer instance
     * @param {NeatComet.api.ICometServerEvents} eventsHandler
     */
    bindServerEvents: function(eventsHandler) {
        this._events = eventsHandler;

        this.comet.on(Jii.comet.server.Server.EVENT_ADD_CONNECTION, function(event) {
            eventsHandler.onNewConnection(event.connection.id);
        });
        this.comet.on(Jii.comet.server.Server.EVENT_REMOVE_CONNECTION, function(event) {
            eventsHandler.onLostConnection(event.connection.id);
        });
    },

    /**
     * @return {boolean}
     */
    getSupportsForwardToClient: function() {
        // TODO: Implement
        return false;
    },

    /**
     * @param {String} channel
     * @param {*} message
     */
    broadcast: function(channel, message) {
        this.comet.sendToChannel(this.__static.ROUTE_PREFIX + channel, message);
    },

    /**
     * @param {String} channel
     * @param {Function} callback
     */
    subscribe: function(channel, callback) {
        /**
         * @param Jii.comet.ChannelEvent event
         */
        callback.__jiiCallbackWrapper = function(event) {
            callback(event.channel.substr(this.__static.ROUTE_PREFIX.length), JSON.parse(event.message));
        }.bind(this);

        this.comet.on('channel:' + this.__static.ROUTE_PREFIX + channel, callback.__jiiCallbackWrapper);
    },

    /**
     * @param {String} channel
     * @param {Function} callback
     */
    unsubscribe: function(channel, callback) {
        if (callback && callback.__jiiCallbackWrapper) {
            callback = callback.__jiiCallbackWrapper;
        }
        this.comet.off('channel:' + this.__static.ROUTE_PREFIX + channel, callback);
    },

    /**
     *
     * @param connectionId
     * @param channel
     * @param data
     */
    pushToClient: function(connectionId, channel, data) {
        this.comet.sendToConnection(connectionId, [
            'channel',
            this.__static.ROUTE_PREFIX + channel,
            JSON.stringify(data)
        ].join(' '));
    },

    /**
     * @param {string|Jii.sql.ActiveQuery} modelClassName
     * @param {object|null} match
     * @param {string} whereType
     * @param {string|null} where
     * @param {object} attributes
     * @param {NeatComet.bindings.BindingServer} binding
     * @returns {Promise} Array of records data
     */
    loadRecords: function(modelClassName, match, whereType, where, attributes, binding) {

        /** @typedef {Jii.sql.ActiveRecord} modelClass  */
        var modelClass = Jii.namespace(modelClassName);
        if (!Jii._.isFunction(modelClass)) {
            throw new Jii.exceptions.InvalidConfigException('Not found model `' + modelClassName + '` for binding');
        }

        /** @typedef {Jii.sql.ActiveQuery} query  */
        var query = modelClass.find();

        // Apply match condition
        if (match) {
            query.where(match);
        }

        // Apply custom filter
        switch (whereType) {

            case NeatComet.api.IOrmLoader.WHERE_NONE:
                // Find all
                break;

            case NeatComet.api.IOrmLoader.WHERE_JS:
                where = NeatComet.bindings.BindingServer.convertWhereJsToSql(where);
                break;

            case NeatComet.api.IOrmLoader.WHERE_SQL:
                where = NeatComet.bindings.BindingServer.convertWhereJsToSql(where);
                query
                    .from(modelClass.tableName() + ' ' + NeatComet.api.IOrmLoader.TABLE_ALIAS_IN_SQL)
                    .andWhere(where, NeatComet.bindings.BindingServer.filterAttributesBySqlParams(where, attributes));
                break;

            default:
                throw new Jii.exceptions.InvalidConfigException('Where type `' + whereType + '` is not implemented');
        }

        // Query via model implementation
        if (!Jii._.isEmpty(this.hasDynamicAttributes)) {
            // @todo
        } else {
            if (binding.attributes !== null) {
                query.select(binding.attributes);
            }
            return query.asArray().all();
        }
    },

    /**
     *
     * @param {Jii.sql.AfterSaveEvent} event
     * @param {} event.sender
     * @private
     */
    _onModelInsert: function(event) {
        /** @typedef {Jii.base.ActiveRecord} model */
        var model = event.sender;

        this.engine.broadcastEvent(model.className(), 'sendAdd', model.getAttributes());
    },

    /**
     *
     * @param {Jii.sql.AfterSaveEvent} event
     * @param {Jii.base.ActiveRecord} event.sender
     * @private
     */
    _onModelUpdate: function(event) {
        /** @typedef {Jii.base.ActiveRecord} model */
        var model = event.sender;

        var oldAttributes = Jii._.extend({}, event.changedAttributes, model.getOldAttributes());
        this.engine.broadcastEvent(model.className(), 'sendUpdate', model.getAttributes(), oldAttributes);
    },

    /**
     *
     * @param {Jii.base.Event} event
     * @param {Jii.base.ActiveRecord} event.sender
     * @private
     */
    _onModelDelete: function(event) {
        /** @typedef {Jii.base.ActiveRecord} model */
        var model = event.sender;

        this.engine.broadcastEvent(model.className(), 'sendRemove', model.getAttributes());
    },

    /**
     * @param {Jii.base.Context} context
     * @param {Jii.comet.server.Connection} context.connection
     * @param {Jii.comet.server.Request} context.request
     * @param {Jii.comet.server.Response} context.response
     */
    _actionOpenProfile: function(context) {
        this._events
            .onOpenProfileCommand(context.connection.id, context.request.get('neat'))
            .then(function(neatResponse) {
                context.response.data = {neat: neatResponse};
                context.response.send();
            });
    },

    /**
     * @param {Jii.base.Context} context
     * @param {Jii.comet.server.Connection} context.connection
     * @param {Jii.comet.server.Request} context.request
     * @param {Jii.comet.server.Response} context.response
     */
    _actionCloseProfile: function(context) {
        context.response.send(); // No wait
        this._events.onCloseProfileCommand(context.connection.id, context.request.get('neat'));
    }

});
