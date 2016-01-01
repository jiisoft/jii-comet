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
     * @param {string} name
     * @param {object} [params]
     */
    getCollection: function(name, params) {
        /** @typedef {NeatComet.bindings.BindingServer} bingind */
        var binding = this.neat.engine.profilesDefinition[name] && this.neat.engine.profilesDefinition[name][name] || null;
        if (!binding) {
            throw new Jii.exceptions.InvalidConfigException('Not found collection for profile id `' + name + '`');
        }

        return Promise.resolve().then(function() {
            // @todo Temporary code
            var opened = this.neat.engine._openedProfilesByProfileId;
            var profile = opened && opened[name] && opened[name][0] || this.neat.openProfile(name, params);
            var collection = profile.getCollection(name);

            if (this.data[name]) {
                collection.set(this.data[name]);
                this.data[name] = null;

                // Mark as exists record (not isNew)
                collection.each(function(model) {
                    model.setOldAttributes(Jii._.clone(model.getAttributes()));
                });

                /*return new Jii.base.Collection(this.data[name], {
                    modelClass: binding.serverModel || binding.clientModel
                })*/
            }
            return collection;
        }.bind(this));
    }

});
