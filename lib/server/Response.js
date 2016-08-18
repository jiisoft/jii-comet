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

	__extends: 'Jii.base.Response',

	/**
	 * @type {Jii.comet.server.HubServer}
	 */
	comet: null,

	/**
	 * @type {number|string}
	 */
	connectionId: null,

	/**
	 * @type {string}
	 */
    requestUid: null,

	/**
	 * @type {*}
	 */
	data: {},

	/**
	 *
	 * @param {*} [data]
	 */
	send(data) {
		data = data || this.data;
        if (Jii._.isObject(data)) {
            data.requestUid = this.requestUid;
        }

		this.comet.sendToConnection(this.connectionId, 'action ' + JSON.stringify(data));
	}

});
