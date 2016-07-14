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
 * @implements Jii.sql.remote.TransportInterface
 */
Jii.defineClass('Jii.comet.client.Client', /** @lends Jii.comet.client.Client.prototype */{

	__extends: 'Jii.base.Component',

	__static: /** @lends Jii.comet.client.Client */{

		/**
		 * @event Jii.comet.client.Client#open
		 * @property {Jii.base.Event} event
		 */
		EVENT_OPEN: 'open',

		/**
		 * @event Jii.comet.client.Client#close
		 * @property {Jii.base.Event} event
		 */
		EVENT_CLOSE: 'close',

		/**
		 * @event Jii.comet.client.Client#beforeSend
		 * @property {Jii.comet.client.MessageEvent} event
		 */
		EVENT_BEFORE_SEND: 'beforeSend',

		/**
		 * @event Jii.comet.client.Client#channel
		 * @property {Jii.comet.ChannelEvent} event
		 */
		EVENT_CHANNEL: 'channel',

		/**
		 * @event Jii.comet.client.Client#channel:
		 * @property {Jii.comet.ChannelEvent} event
		 */
		EVENT_CHANNEL_NAME: 'channel:',

		/**
		 * @event Jii.comet.client.Client#message
		 * @property {Jii.comet.client.MessageEvent} event
		 */
		EVENT_MESSAGE: 'message',

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
		 * @type {string}
		 */
		CHANNEL_NAME_ALL: '__allVfcOS7'

	},

	/**
	 * @type {Jii.comet.client.transport.TransportInterface}
	 */
	transport: {
		className: 'Jii.comet.client.transport.Sockjs'
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
	 * @type {boolean}
	 */
	autoSubscribeOnReconnect: true,

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

	_subscribes: [],

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
	 * Return true, if connection closed by client (manually)
	 * @returns {boolean}
	 */
	isForceClosed: function() {
		return this._forceClosed;
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
	 * @param {string} name
	 * @param {function} handler
	 * @param {*} [data]
	 * @param {boolean} [isAppend]
	 */
	on: function(name, handler, data, isAppend) {
		// Subscribe on hub channels
		if (name === this.__static.EVENT_CHANNEL && !this.hasEventHandlers(name)) {
			this.subscribe(this.__static.CHANNEL_NAME_ALL);
		}
		if (name.indexOf(this.__static.EVENT_CHANNEL_NAME) === 0) {
			this.subscribe(name.substr(this.__static.EVENT_CHANNEL_NAME.length));
		}

		this.__super.apply(this, arguments);
	},

	/**
	 * @param {string} name
	 * @param {function} [handler]
	 * @return boolean
	 */
	off: function(name, handler) {
		this.__super.apply(this, arguments);

		// Unsubscribe on hub channels
		if (name === this.__static.EVENT_CHANNEL && !this.hasEventHandlers(name)) {
			this.unsubscribe(this.__static.CHANNEL_NAME_ALL);
		}
		if (name.indexOf(this.__static.EVENT_CHANNEL_NAME) === 0) {
			this.unsubscribe(name.substr(this.__static.EVENT_CHANNEL_NAME.length));
		}
	},

	/**
	 * @param {string} channel
	 */
	subscribe: function(channel) {
		if (Jii._.indexOf(this._subscribes, channel) === -1) {
			this._sendInternal('subscribe ' + channel);
			this._subscribes.push(channel);
		}
	},

	/**
	 * @param {string} channel
	 */
	unsubscribe: function(channel) {
		var index = Jii._.indexOf(this._subscribes, channel);
		if (index !== -1) {
			this._sendInternal('unsubscribe ' + channel);
			this._subscribes.splice(index, 1);
		}
	},

	/**
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	hasChannelHandlers: function(name) {
		return this.hasEventHandlers(this.__static.EVENT_CHANNEL_NAME + name);
	},

	/**
	 *
	 * @param {string} channel
	 * @param {object} data
	 */
	send: function(channel, data) {
		if (typeof data !== 'string') {
			data = JSON.stringify(data);
		}

		this._sendInternal('channel ' + channel + ' ' + data);
	},

	/**
	 *
	 * @param {string} route
	 * @param {object} [data]
	 */
	request: function (route, data) {
		data = data || {};
		data.requestUid = Jii.helpers.String.generateUid();

		// Trigger event for append data
		var event = new Jii.comet.client.RequestEvent({
			route: route,
			params: data
		});
		this.trigger(this.__static.EVENT_BEFORE_REQUEST, event);
		data = event.params;

		// Generate promise for wait response
		var promise = new Promise(function(resolve) {
			this._requestsInProcess[data.requestUid] = {
				route: route,
				resolve: resolve
			};
		}.bind(this));

		// Send request
		this._sendInternal('action ' + route + ' ' + JSON.stringify(data));

		return promise;
	},

	/**
	 *
	 * @param {string} message
	 * @private
	 */
	_sendInternal: function(message) {
		// Trigger event before send message
		var event = new Jii.comet.client.MessageEvent({
			message: message
		});
		this.trigger(this.__static.EVENT_BEFORE_SEND, event);
		message = event.message;

		if (this._isOpened) {
			this.transport.send(message);
		}
	},

	_onOpen: function (event) {
		if (!this._isOpened) {
			this._isOpened = true;

			if (this.autoSubscribeOnReconnect) {
				var channels = this._subscribes;
				this._subscribes = [];
				Jii._.each(channels, this.subscribe.bind(this));
			}

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
		if (event.message.indexOf('action ') === 0) {
			var response = JSON.parse(event.message.substr(7));
			if (response.requestUid && this._requestsInProcess[response.requestUid]) {
				this._requestsInProcess[response.requestUid].resolve(response);

				// Trigger request event
				this.trigger(this.__static.EVENT_REQUEST, new Jii.comet.client.RequestEvent({
					route: this._requestsInProcess[response.requestUid].route,
					params: response
				}));

				delete this._requestsInProcess[response.requestUid];
			}
		}

		if (event.message.indexOf('channel ') === 0) {
			var message = event.message.substr(8);
			var i = message.indexOf(' ');
			var messageString = message.substr(i + 1);
			var params = messageString.match(/^[\{\[]/) ? JSON.parse(messageString) : null;

			var channelEvent = new Jii.comet.ChannelEvent({
				channel: message.substr(0, i),
				params: params,
				message: !params ? messageString : null
			});

			// Trigger channel and channel:* events
			this.trigger(this.__static.EVENT_CHANNEL_NAME + channelEvent.channel, channelEvent);
			this.trigger(this.__static.EVENT_CHANNEL, channelEvent);
		}

		// Trigger message event
		this.trigger(this.__static.EVENT_MESSAGE, new Jii.comet.client.MessageEvent({
			message: event.message
		}));
	}

});
