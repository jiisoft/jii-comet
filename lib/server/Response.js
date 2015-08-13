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
 * @class Jii.comet.server.Response
 * @extends Jii.base.Response
 */
Jii.defineClass('Jii.comet.server.Response', /** @lends Jii.comet.server.Response.prototype */{

	__extends: Jii.base.Response,

	/**
	 * @type {Jii.comet.server.HubServer}
	 */
	comet: null,

	/**
	 * @type {number|string}
	 */
	connectionId: null,

	/**
	 * @type {*}
	 */
	data: null,

	/**
	 *
	 * @param {*} [data]
	 */
	send: function(data) {
		data = data || this.data;

		this.comet.sendToConnection(this.connectionId, data);
	}

});
