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
 * @class Jii.comet.client.NeatClient
 * @extends Jii.base.Component
 * @implements NeatComet.api.ICometClient
 */
Jii.defineClass('Jii.comet.client.NeatClient', /** @lends Jii.comet.client.NeatClient.prototype */{

    __extends: Jii.base.Component,

    __static: /** @lends Jii.comet.client.NeatClient */{

        ROUTE_PREFIX: 'profiles:'

    },

    /**
     * @type {Jii.comet.client.Client}
     */
    comet: null,

    /**
     * @type {object}
     */
    bindings: null,

    /**
     * @type {NeatComet.NeatCometClient}
     */
    engine: {
        className: 'NeatComet.NeatCometClient'
    },

    init: function () {
        this.__super();

        this.comet = this.comet === null ?
            Jii.app.get('comet') :
            (
                this.comet instanceof Jii.base.Component ?
                    this.comet :
                    Jii.createObject(this.comet)
            );

        // Move NeatComet to Jii namespace
        Jii._.extend(Jii.namespace('NeatComet'), NeatComet);

        this.engine.comet = this;
        this.engine.profilesDefinition = this.bindings;
        this.engine.createCollection = this.engine.createCollection || this._createCollection.bind(this);
        this.engine = Jii.createObject(this.engine);
    },

    /**
     *
     * @param profileId
     * @param params
     * @returns {NeatComet.router.OpenedProfileClient}
     */
    openProfile: function(profileId, params) {
        return this.engine.openProfile(profileId, params);
    },

    getCollection: function(profileId, bindingId) {

    },

    /**
     * Allowed to expect that it will be called only once per ICometServer instance
     * @param {NeatComet.api.ICometClientEvents} eventsHandler
     */
    bindEvents: function(eventsHandler) {
        this.comet.on(Jii.comet.client.Client.EVENT_CHANNEL, function(event) {
            if (event.channel.indexOf(this.__static.ROUTE_PREFIX) === 0) {
                eventsHandler.onMessage(event.channel.substr(this.__static.ROUTE_PREFIX.length), event.params);
            }
        }.bind(this));

        this.comet.on('open', function() {
            eventsHandler.onConnectionRestore();
        });
    },

    /**
     * @param {object} params
     * @param {NeatComet.api.ICometClient~openSuccess} successCallback
     */
    sendOpen: function(params, successCallback) {
        this.comet.request('neat/open', { neat: params }).then(function(data) {

            // Chain with NeatComet handler
            successCallback(data.neat);
        });
    },

    /**
     * @param {string[]} ids
     */
    sendClose: function(ids) {
        this.comet.request('neat/close', { neat: ids });
    },

    _createCollection: function(profileId, bindingId, definition, openedProfile) {
        var modelClassName = definition.clientModel || definition.serverModel || Jii.base.ActiveRecord;
        return new Jii.base.Collection([], {
            modelClass: Jii.namespace(modelClassName)
        });
    }

});
