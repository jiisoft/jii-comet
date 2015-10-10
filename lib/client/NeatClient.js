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

var NeatComet = require('NeatComet');
require('NeatComet/src/lib/adapters/backbone/NeatCometBackboneCollectionAdapter');

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
    modelClassMapping: {},

    /**
     * @type {NeatComet.NeatCometClient}
     */
    _neat: null,

    init: function () {
        this.__super();

        this.comet = this.comet === null ?
            Jii.app.get('comet') :
            (
                this.comet instanceof Jii.base.Component ?
                    this.comet :
                    Jii.createObject(this.comet)
            );

        this._neat = new NeatComet.NeatCometClient();
        this._neat.comet = this;
        this._neat.createCollection = NeatComet.adapters.backbone.NeatCometBackboneCollectionAdapter.install({
            getModelClass: function(profileId, bindingId, definition, openedProfile) {
                return (definition && definition.model) ? Joints.namespace(definition.model) : Joints.RelationalModel;
            }
        });

        this._neat.init();
    },

    /**
     *
     * @param profileId
     * @param params
     */
    openProfile: function(profileId, params) {
        this._neat.openProfile(profileId, params);
    },

    /**
     *
     * @param namespace
     */
    populateNamespace: function(namespace) {
        this._neat.populateNamespace(namespace);
    },

    /**
     * Allowed to expect that it will be called only once per ICometServer instance
     * @param {NeatComet.api.ICometClientEvents} eventsHandler
     */
    bindEvents: function(eventsHandler) {
        this.comet.on(Jii.comet.client.Client.EVENT_CHANNEL, function(event) {
            if (event.channel.indexOf(this.__static.ROUTE_PREFIX) == 0) {
                eventsHandler.onMessage(event.channel.substr(this.__static.ROUTE_PREFIX.length), JSON.parse(event.message));
            }
        });

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

    _createCollection: function(profileId, bindingId) {

        // Default model class
        var modelClass = Joints.RelationalModel;

        // Allow set specific model class
        if (this.modelClassMapping[profileId] && this.modelClassMapping[profileId][bindingId]) {
            modelClass = Jii.namespace(this.modelClassMapping[profileId][bindingId]);
        }

        return new Backbone.Collection([], {
            model: modelClass
        });
    }

});
