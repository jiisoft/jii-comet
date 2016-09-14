/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var _pick = require('lodash/pick');
var Component = require('jii/base/Component');

/**
 * @class Jii.comet.server.Connection
 * @extends Jii.base.Component
 */
module.exports = Jii.defineClass('Jii.comet.server.Connection', /** @lends Jii.comet.server.Connection.prototype */{

	__extends: Component,

	/**
	 * Connection id
	 * @type {number|string}
	 */
	id: null,

	/**
	 * @type {Jii.comet.server.Request}
	 */
	request: null,

	/**
	 * @type {object}
	 */
	originalConnection: null,

    toJSON() {
		return _pick(this, [
			'id'
		]);
	}

});
