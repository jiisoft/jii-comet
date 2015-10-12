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
 * @class Jii.comet.server.Request
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.comet.server.Request', /** @lends Jii.comet.server.Request.prototype */{

	__extends: Jii.base.Component,

    /**
     * @type {string}
     */
    uid: null,

	/**
	 * @type {object}
	 */
	headers: null,

	/**
	 * @type {string}
	 */
	ip: null,

	/**
	 * @type {number}
	 */
	port: null,

	/**
	 * @type {object}
	 */
	params: {},

    get: function(name) {
        if (Jii._.has(this.params, name)) {
            return this.params[name];
        }
        return this.__super(name);
    },

    getParam: function(name) {
        return this.params[name] || null;
    },

	toJson: function() {
		return Jii._.pick(this, [
			'headers',
			'ip',
            'port',
            'params'
		]);
	}

});
