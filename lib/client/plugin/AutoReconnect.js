
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

	__extends: 'Jii.comet.client.plugin.PluginInterface',

	/**
	 * @type {boolean}
	 */
	enable: true,

	/**
	 * Minimal retry interval in milliseconds
	 * @type {number}
	 */
	minRetryInterval: 2000,

	/**
	 * Maximal retry interval in milliseconds
	 * @type {number}
	 */
	maxRetryInterval: 20000,

	/**
	 * @type {number}
	 */
	_tryReconnectNumber: 0,

	init: function() {
		this.comet.on(Jii.comet.client.Client.EVENT_OPEN, this._onOpen.bind(this));
		this.comet.transport.on(Jii.comet.client.transport.TransportInterface.EVENT_CLOSE, this._onClose.bind(this));
	},

	_onOpen: function() {
		this._tryReconnectNumber = 0;
	},

	_onClose: function() {
		if (this.enable && !this.comet.isForceClosed()) {
			setTimeout(function() {
				this._tryReconnectNumber++;
				this.comet.open();
			}.bind(this), this._tryReconnectNumber > 10 ? this.maxRetryInterval : this.minRetryInterval);
		}
	}

});