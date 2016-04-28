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

/**
 * @class Jii.comet.client.NeatContextProfiles
 * @extends Jii.comet.INeatContextProfiles
 */
Jii.defineClass('Jii.comet.client.NeatContextProfiles', /** @lends Jii.comet.client.NeatContextProfiles.prototype */{

    __extends: 'Jii.comet.INeatContextProfiles',

    /**
     * @type {Jii.comet.client.NeatClient}
     */
    neat: 'neat',

    /**
     * @type {object}
     */
    data: {},

    init: function () {
        this.__super();

        this.neat = Jii.app.get(this.neat);
    },

    /**
     *
     * @param {string} profileName
     * @param {string} collectionName
     * @param {object} [params]
     * @returns {Promise.<T>}
     */
    getCollection: function(profileName, collectionName, params) {
        params = params || {};

        /** @typedef {NeatComet.bindings.BindingServer} bingind */
        /*var binding = this.neat.engine.profilesDefinition[profileName] && this.neat.engine.profilesDefinition[profileName][name] || null;
        if (!binding) {
            throw new Jii.exceptions.InvalidConfigException('Not found collection for profile id `' + name + '`');
        }*/

        return Promise.resolve().then(function() {
            // @todo Temporary code
            var opened = this.neat.engine._openedProfilesByProfileId;
            var profile = opened && opened[profileName] && opened[profileName][0] || this.neat.openProfile(profileName, params);
            var collection = profile.getCollection(collectionName);

            if (this.data[collectionName]) {
                collection.set(this.data[collectionName]);
                this.data[collectionName] = null;

                // Mark as exists record (not isNew)
                collection.each(function(model) {
                    model.setOldAttributes(Jii._.clone(model.getAttributes()));
                });

                /*return new Jii.base.Collection(this.data[collectionName], {
                    modelClass: binding.serverModel || binding.clientModel
                })*/
            }
            return collection;
        }.bind(this));
    }

});
