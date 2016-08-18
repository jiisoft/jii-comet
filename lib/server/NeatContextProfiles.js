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
 * @class Jii.comet.server.NeatContextProfiles
 * @extends Jii.comet.INeatContextProfiles
 */
Jii.defineClass('Jii.comet.server.NeatContextProfiles', /** @lends Jii.comet.server.NeatContextProfiles.prototype */{

    __extends: 'Jii.comet.INeatContextProfiles',

    /**
     * @type {Jii.comet.client.NeatClient}
     */
    neat: 'neat',

    /**
     * @type {object}
     */
    data: {},

    init() {
        this.__super();

        this.neat = Jii.app.get(this.neat);
    },

    /**
     *
     * @param {string} name
     * @param {object} [params]
     */
    getCollection(name, params) {

        /** @typedef {NeatComet.bindings.BindingServer} bingind */
        var binding = this.neat.engine.profileBindings[name] && this.neat.engine.profileBindings[name][name] || null;
        if (!binding) {
            throw new Jii.exceptions.InvalidConfigException('Not found collection for profile id `' + name + '`');
        }

        var collection = new Jii.base.Collection([], {
            modelClass: binding.serverModel || binding.clientModel
        });
        return new Promise(resolve => {
            // @todo open profile for client..?

            binding.loadDataLocally(params).then(data => {
                // Store data for publish to client
                this.data[name] = data;

                collection.reset(data);
                resolve(collection);
            });
        });
    }

});
