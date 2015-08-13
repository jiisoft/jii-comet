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

	toJson: function() {
		return Jii._.pick(this, [
			'headers',
			'ip',
			'port'
		]);
	}

});
