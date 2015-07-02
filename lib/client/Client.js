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
 * Read-only from api stationUid
 * @type {null}
 */
var stationUid = null;

/**
 * @class Jii.comet.client.Client
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.comet.client.Client', /** @lends Jii.comet.client.Client.prototype */{

	__extends: Jii.base.Component,

	__static: /** @lends Jii.comet.client.Client */{

		/**
		 * @event Jii.comet.client.client.Client#open
		 * @property {Jii.base.Event} event
		 */
		EVENT_OPEN: 'open',

		/**
		 * @event Jii.comet.client.client.Client#close
		 * @property {Jii.base.Event} event
		 */
		EVENT_CLOSE: 'close',

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

		/**
		 * @event Jii.comet.client.Client#beforeSend
		 * @property {Jii.comet.client.ChannelEvent} event
		 */
		EVENT_BEFORE_SEND: 'beforeSend',

		/**
		 * @event Jii.comet.client.Client#channel
		 * @property {Jii.comet.client.ChannelEvent} event
		 * @property {string} event.channel
		 * @property {object} event.data
		 */
		EVENT_CHANNEL: 'channel',

		/**
		 * @event Jii.comet.client.Client#channel:
		 * @property {Jii.comet.client.ChannelEvent} event
		 */
		EVENT_CHANNEL_NAME: 'channel:',

		/**
		 * @event Jii.comet.client.Client#message
		 * @property {Jii.comet.client.MessageEvent} event
		 */
		EVENT_MESSAGE: 'message'

	},

	/**
	 * @type {Jii.comet.client.transport.TransportInterface}
	 */
	transport: {
		className: 'Jii.comet.client.transport.SockJs'
	},

	plugins: {

		/**
		 * @type {Jii.comet.client.plugin.AutoReconnect}
		 */
		autoReconnect: {
			className: 'Jii.comet.client.plugin.AutoReconnect'
		}

	},

	/**
	 * Max comet workers number. Used for auto generate different server urls (balancer).
	 */
	workersCount: null,

	/**
	 * @type {boolean}
	 */
	autoOpen: true,

	/**
	 * Url to comet server
	 * @type {string}
	 */
	_serverUrl: '',

	/**
	 * @type {boolean}
	 */
	_isOpened: false,

	/**
	 * @type {boolean}
	 */
	_forceClosed: false,

	/**
	 * @type {object}
	 */
	_requestsInProcess: {},

	init: function () {
		stationUid = Jii.helpers.String.generateUid();

		// Init transport
		this.transport = Jii.createObject(this.transport);
		this.transport.on(Jii.comet.client.transport.TransportInterface.EVENT_OPEN, this._onOpen.bind(this));
		this.transport.on(Jii.comet.client.transport.TransportInterface.EVENT_CLOSE, this._onClose.bind(this));
		this.transport.on(Jii.comet.client.transport.TransportInterface.EVENT_MESSAGE, this._onMessage.bind(this));

		// Init plugins
		Jii._.each(this.plugins, function(config, name) {
			config.comet = this;
			this.plugins[name] = Jii.createObject(config);
		}.bind(this));

		// Auto open
		if (this.autoOpen) {
			this.open();
		}
	},

	/**
	 * Set url to comet server
	 * Detect server url by pattern, if set. Used for balancer server by clients random().
	 * @param {string} value
	 */
	setServerUrl: function(value) {
		// Normalize
		if (value.indexOf('//') === 0) {
			var sslSuffix = location.protocol === 'https' ? 's' : ''
			value = 'http' + sslSuffix + ':' + value;
		}

		// Balancer
		if (value.indexOf('{workerIndex}') !== -1) {
			var min = 0;
			var max = Math.max(this.workersCount || 0, 1) - 1;
			var workerIndex = min + Math.floor(Math.random() * (max - min + 1));
			value = value.replace('{workerIndex}', String(workerIndex));
		}

		// Switch server URL protocol to HTTP instead of HTTPS if browser is IE9 or lesser
		var isIE = window.navigator && (/MSIE/.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent));
		if (isIE && window.document && window.document.all && !window.atob) {
			var isSsl = /^(http|ws)s/.test(value);
			if (isSsl === location.protocol === 'https') {
				value = value.replace(/^(http|ws)s/, '$1');
			}
		}

		this._serverUrl = value;
	},

	/**
	 * Return comet server url
	 * @returns {string}
	 */
	getServerUrl: function() {
		return this._serverUrl;
	},

	/**
	 * Return station UID - unique id of current javascript environment (browser tab)
	 * @returns {null}
	 */
	getStationUid: function() {
		return stationUid;
	},

	/**
	 * Return true, if connection is opened
	 * @returns {boolean}
	 */
	isOpened: function() {
		return this._isOpened;
	},

	/**
	 * Open connection
	 */
	open: function() {
		this._forceClosed = false;
		if (!this._isOpened) {
			this.transport.open(this._serverUrl);
		}
	},

	/**
	 * Close connection
	 */
	close: function() {
		this._forceClosed = true;
		if (this._isOpened) {
			this.transport.close();
		}
	},

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
		this._send('action ' + method + ' ' + JSON.stringify(data));

		return promise;
	},

	/**
	 *
	 * @param {string} channel
	 * @param {object} data
	 */
	send: function(channel, data) {
		this._send('channel ' + channel + ' ' + JSON.stringify(data));
	},

	/**
	 *
	 * @param {string} message
	 * @private
	 */
	_send: function(message) {
		// Trigger event before send message
		this.trigger(this.__static.EVENT_BEFORE_SEND, new Jii.comet.client.MessageEvent({
			message: message
		}));

		if (this._isOpened) {
			this.transport.send(message);
		}
	},

	_onOpen: function (event) {
		if (!this._isOpened) {
			this._isOpened = true;
			this.trigger(this.__static.EVENT_OPEN, event);
		}
	},

	_onClose: function (event) {
		if (this._isOpened) {
			this._isOpened = false;
			this.trigger(this.__static.EVENT_CLOSE, event);
		}
	},

	_onMessage: function (event) {
		var i = event.message.indexOf(' ');
		var type = event.message.substr(0, i);
		var message = event.message.substr(i + 1);

		switch (type) {
			case 'channel':
				// Trigger channel and channel:* events
				var i2 = message.indexOf(' ');
				var channelEvent = new Jii.comet.client.ChannelEvent({
					channel: message.substr(0, i2),
					data: JSON.parse(message.substr(i2 + 1))
				});
				this.trigger(this.__static.EVENT_CHANNEL_NAME + channelEvent.channel, channelEvent);
				this.trigger(this.__static.EVENT_CHANNEL, channelEvent);
				break;

			case 'action':
				var response = JSON.parse(message);
				if (response.requestUid && this._requestsInProcess[response.requestUid]) {
					this._requestsInProcess[response.requestUid].resolve(response);

					// Trigger request event
					this.trigger(this.__static.EVENT_REQUEST, new Jii.comet.client.RequestEvent({
						method: this._requestsInProcess[response.requestUid].method,
						params: response
					}));

					delete this._requestsInProcess[response.requestUid];
				}
				break;
		}

		// Trigger message event
		this.trigger(this.__static.EVENT_MESSAGE, new Jii.comet.client.MessageEvent({
			message: event.message
		}));
	}

});
