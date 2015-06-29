
'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('./PluginInterface');

/**
 * @class Jii.comet.client.plugin.AutoReconnect
 * @extends Jii.comet.client.plugin.PluginInterface
 */
Jii.defineClass('Jii.comet.client.plugin.AutoReconnect', /** @lends Jii.comet.client.plugin.AutoReconnect.prototype */{

	__extends: Jii.comet.client.plugin.PluginInterface,

	/**
	 * @type {boolean}
	 */
	enable: true,

	/**
	 * Minimal retry interval in milliseconds
	 * @type {number}
	 */
	minRetryInterval: 5000,

	/**
	 * Maximal retry interval in milliseconds
	 * @type {number}
	 */
	maxRetryInterval: 20000,

	/**
	 * @type {number}
	 */
	_tryReconnectNumber: null,

	/**
	 * @type {boolean}
	 */
	_closedByClient: false,

	init: function() {
		this.comet.on(Jii.comet.client.Client.EVENT_OPEN, this._onOpen.bind(this));
		this.comet.on(Jii.comet.client.Client.EVENT_CLOSE, this._onClientClose.bind(this));
		this.comet.transport.on(Jii.comet.client.transport.TransportInterface.EVENT_CLOSE, this._onTransportClose.bind(this));
	},

	_onOpen: function() {
		this._closedByClient = false;
		this._tryReconnectNumber = 0;
	},

	_onClientClose: function() {
		this._closedByClient = true;
	},

	_onTransportClose: function() {
		if (this.enable && !this._closedByClient) {
			setTimeout(function() {
				this._tryReconnectNumber++;
				this.comet.open();
			}.bind(this), this._tryReconnectNumber > 10 ? this.maxRetryInterval : this.minRetryInterval);
		}
	}

});