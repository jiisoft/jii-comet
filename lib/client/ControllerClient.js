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

require('./Client');

/**
 * @class Jii.comet.client.ControllerClient
 * @extends Jii.comet.client.Client
 */
Jii.defineClass('Jii.comet.client.ControllerClient', /** @lends Jii.comet.client.ControllerClient.prototype */{

	__extends: Jii.comet.client.Client,

	__static: /** @lends Jii.comet.client.Client */{

		/**
		 * @event Jii.comet.client.Client#beforeRequest
		 * @property {Jii.comet.client.RequestEvent} event
		 */
		EVENT_BEFORE_REQUEST: 'beforeRequest',

		/**
		 * @event Jii.comet.client.Client#request
		 * @property {Jii.comet.client.RequestEvent} event
		 */
		EVENT_REQUEST: 'request',

	},

	/**
	 * @type {object}
	 */
	_requestsInProcess: {},

	/**
	 *
	 * @param {string} method
	 * @param {object} [data]
	 */
	request: function (method, data) {
		data = data || {};
		data.requestUid = Jii.helpers.String.generateUid();

		// Trigger event for append data
		this.trigger(this.__static.EVENT_BEFORE_REQUEST, new Jii.comet.client.RequestEvent({
			method: method,
			params: data
		}));

		// Generate promise for wait response
		var promise = new Promise(function(resolve) {
			this._requestsInProcess[data.requestUid] = {
				method: method,
				resolve: resolve
			};
		}.bind(this));

		// Send request
		this._sendInternal('action ' + method + ' ' + JSON.stringify(data));

		return promise;
	},

	_onMessage: function (event) {
		if (event.message.indexOf('action ') === 0) {
			var response = JSON.parse(event.message.substr(7));
			if (response.requestUid && this._requestsInProcess[response.requestUid]) {
				this._requestsInProcess[response.requestUid].resolve(response);

				// Trigger request event
				this.trigger(this.__static.EVENT_REQUEST, new Jii.comet.client.RequestEvent({
					method: this._requestsInProcess[response.requestUid].method,
					params: response
				}));

				delete this._requestsInProcess[response.requestUid];
			}
		}

		this.__super(event);
	}

});
