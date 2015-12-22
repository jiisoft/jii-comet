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
 * @class Jii.comet.server.Connection
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.comet.server.Connection', /** @lends Jii.comet.server.Connection.prototype */{

	__extends: 'Jii.base.Component',

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

    toJSON: function() {
		return Jii._.pick(this, [
			'id'
		]);
	}

});
