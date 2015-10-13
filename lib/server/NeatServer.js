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
 */
Jii.defineClass('Jii.comet.server.NeatServer', /** @lends Jii.comet.server.NeatServer.prototype */{

	__extends: Jii.base.Object,

    __static: /** @lends Jii.comet.server.NeatServer */{

        ROUTE_PREFIX: 'profiles:'

    },

    /**
     * @type {string}
     */
    configFileName: null,

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
     * Note: onOpenProfileCommand() and onCloseProfileCommand must be called from actions explicitly.
     * There's no way to subscribe for them in Jii.
     *
     * @type {NeatComet.api.ICometServerEvents}
     */
    _events: null,

    /**
     * @type {NeatComet.NeatCometServer}
     */
    _neat: null,

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

        this.dataLoadHandler = this.dataLoadHandler || function() {
                return Promise.resolve({});
            };

        this._neat = new NeatComet.NeatCometServer();
        this._neat.setup({
            comet: this,
            configFileName: this.configFileName,
            externalDataLoader: this.dataLoadHandler.bind(this)
        });

        Jii.app.inlineActions['neat/open'] = this._actionOpenProfile.bind(this);
        Jii.app.inlineActions['neat/close'] = this._actionCloseProfile.bind(this);
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
        this.comet.on(
            'channel:' + this.__static.ROUTE_PREFIX + channel,
            /**
             * @param Jii.comet.ChannelEvent event
             */
            function(event) {
                callback(event.channel.substr(this.__static.ROUTE_PREFIX.length), JSON.parse(event.message));
            }.bind(this)
        );
    },

    /**
     * @param {String} channel
     * @param {Function} callback
     */
    unsubscribe: function(channel, callback) {
        // @todo unsubscribe anonymous function
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
    }

});
