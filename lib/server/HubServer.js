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
 * @class Jii.comet.server.HubServer
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.comet.server.HubServer', /** @lends Jii.comet.server.HubServer.prototype */{

	__extends: Jii.base.Component,

	__static: /** @lends Jii.comet.server.HubServer */{

		/**
		 * @event Jii.comet.client.Client#channel
		 * @property {Jii.comet.ChannelEvent} event
		 */
		EVENT_CHANNEL: 'channel',

		/**
		 * @event Jii.comet.client.Client#channel:%channel_name%
		 * @property {Jii.comet.ChannelEvent} event
		 */
		EVENT_CHANNEL_NAME: 'channel:',


		/**
		 * @event Jii.comet.server.HubServer#message
		 * @property {Jii.comet.server.MessageEvent} event
		 */
		EVENT_MESSAGE: 'message',

		/**
		 * @type {string}
		 */
		CHANNEL_NAME_ALL: '__allVfcOS7',

		/**
		 * @type {string}
		 */
		CHANNEL_NAME_ACTION: '__actionXZj1sf',

		/**
		 * @type {string}
		 */
		CHANNEL_NAME_CONNECTION: '__connectionN9a63w:'

	},

	/**
	 * @type {boolean}
	 */
	listenActions: true,

	/**
	 * @type {Jii.comet.server.hub.HubInterface}
	 */
	hub: {
		className: 'Jii.comet.server.hub.Redis'
	},

	/**
	 * @type {Jii.comet.server.queue.QueueInterface}
	 */
	queue: {
		className: 'Jii.comet.server.queue.Redis'
	},

	/**
	 * @type {string}
	 */
	_serverUid: null,

	init: function () {
		this.__super();

		// Generate unique server uid
		this._serverUid = Jii.helpers.String.generateUid();

		// Init hub
		this.hub = Jii.createObject(this.hub);
		this.hub.on(Jii.comet.server.hub.HubInterface.EVENT_MESSAGE, this._onHubMessage.bind(this));

		// Init queue
		this.queue = Jii.createObject(this.queue);
	},

	/**
	 * Start listen income comet connections
	 */
	start: function () {
		return Promise.all([
			this.hub.start(),
			this.queue.start()
		]).then(function() {
			if (this.listenActions) {
				this.hub.subscribe(this.__static.CHANNEL_NAME_ACTION);
			}
		}.bind(this));
	},

	/**
	 * Abort current connections and stop listen income comet connections
	 */
	stop: function() {
		return Promise.all([
			this.hub.stop(),
			this.queue.stop()
		]);
	},

	/**
	 * Send data to channel
	 * @param {string} channel
	 * @param {*} data
	 */
	sendToChannel: function (channel, data) {
		if (typeof data !== 'string') {
			data = JSON.stringify(data);
		}

		Jii.trace('Comet server send to channel `' + channel + '` data: ' + data);
		this.hub.send(channel, data);
		this.hub.send(this.__static.CHANNEL_NAME_ALL, channel + ' ' + data);
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
			this.hub.subscribe(this.__static.CHANNEL_NAME_ALL);
		}
		if (name.indexOf(this.__static.EVENT_CHANNEL_NAME) === 0) {
			var channel = name.substr(this.__static.EVENT_CHANNEL_NAME.length);
			if (!this.hasChannelHandlers(channel)) {
				this.hub.subscribe(channel);
			}
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
			this.hub.unsubscribe(this.__static.CHANNEL_NAME_ALL);
		}
		if (name.indexOf(this.__static.EVENT_CHANNEL_NAME) === 0) {
			var channel = name.substr(this.__static.EVENT_CHANNEL_NAME.length);
			if (!this.hasChannelHandlers(channel)) {
				this.hub.unsubscribe(channel);
			}
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
	 * Send data to connection
	 * @param {number|string} id
	 * @param {*} message
	 */
	sendToConnection: function (id, message) {
		if (typeof message !== 'string') {
			message = JSON.stringify(message);
		}

		Jii.trace('Comet server send to connection `' + id + '` data: ' + message);

		this.hub.send(this.__static.CHANNEL_NAME_CONNECTION + id, message);
	},

	/**
	 *
	 * @param {Jii.comet.server.Connection} connection
	 * @param {string} route
	 * @param {object} data
	 */
	pushActionToQueue: function(connection, route, data) {
		var queueData = {
			connection: connection.toJson(),
			request: connection.request.toJson(),
			data: data
		};
		this.queue.push(JSON.stringify(queueData)).then(function() {

			// Notify hub servers about new action
			this.hub.send(this.__static.CHANNEL_NAME_ACTION, route);
		}.bind(this));
	},

	/**
	 * Income message from hub
	 * @param {Jii.comet.ChannelEvent} event
	 * @private
	 */
	_onHubMessage: function (event) {
		Jii.trace('Comet hub income, channel `' + event.channel + '`: ' + event.message);

		this.trigger(this.__static.EVENT_MESSAGE, new Jii.comet.ChannelEvent({
			channel: event.channel,
			message: event.message
		}));

		switch (event.channel) {
			case this.__static.CHANNEL_NAME_ACTION:
				var route = event.message;

				if (route && Jii.app.existsRoute(route)) {
					this.queue.pop().then(function(message) {
						// Empty queue - skip
						if (message === null) {
							return;
						}

						var data = JSON.parse(message);
						var context = Jii.createContext();

						context.setComponent('request', new Jii.comet.server.Request(data.request));
						context.setComponent('connection', new Jii.comet.server.Connection(Jii._.extend({}, data.connection, {
							request: context.get('request')
						})));
						context.setComponent('response', new Jii.comet.server.Response({
							comet: this,
							connectionId: context.get('connection').id
						}));

						Jii.app.runAction(route, context);
					}.bind(this));
				}
				break;

			case this.__static.CHANNEL_NAME_ALL:
				var i2 = event.message.indexOf(' ');
				this.trigger(this.__static.EVENT_CHANNEL, new Jii.comet.ChannelEvent({
					channel: event.message.substr(0, i2),
					message: event.message.substr(i2 + 1)
				}));
				break;

			default:
				this.trigger(this.__static.EVENT_CHANNEL_NAME + event.channel, new Jii.comet.ChannelEvent({
					channel: event.channel,
					message: event.message
				}));
		}
	}

});
