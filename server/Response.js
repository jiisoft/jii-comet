/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var _isObject = require('lodash/isObject');
var Response = require('jii/base/Response');

/**
 * @class Jii.comet.server.Response
 * @extends Jii.base.Response
 */
var Response = Jii.defineClass('Jii.comet.server.Response', /** @lends Jii.comet.server.Response.prototype */{

	__extends: Response,

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
        if (_isObject(data)) {
            data.requestUid = this.requestUid;
        }

		this.comet.sendToConnection(this.connectionId, 'action ' + JSON.stringify(data));
	}

});

module.exports = Response;