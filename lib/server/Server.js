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

require('./HubServer');

/**
 * @class Jii.comet.server.Server
 * @extends Jii.comet.server.HubServer
 */
Jii.defineClass('Jii.comet.server.Server', /** @lends Jii.comet.server.Server.prototype */{

	__extends: 'Jii.comet.server.HubServer',

	__static: /** @lends Jii.comet.server.Server */{

		/**
		 * @event Jii.comet.server.Server#addConnection
		 * @property {Jii.comet.server.ConnectionEvent} event
		 */
		EVENT_ADD_CONNECTION: 'addConnection',

		/**
		 * @event Jii.comet.server.Server#removeConnection
		 * @property {Jii.comet.server.ConnectionEvent} event
		 */
		EVENT_REMOVE_CONNECTION: 'removeConnection'

	},

	/**
	 * @type {string}
	 */
	host: '0.0.0.0',

	/**
	 * @type {number}
	 */
	port: 4100,

	/**
	 * @type {Jii.comet.server.transport.TransportInterface}
	 */
	transport: {
		className: 'Jii.comet.server.transport.SockJs'
	},

	/**
	 * @type {Server}
	 */
	_httpServer: null,

	/**
	 * @type {object}
	 */
	_connections: {},

	/**
	 * @type {object}
	 */
	_subscribes: {},

	init: function () {
		this.__super();

		// Create http server
		this._httpServer = require('http').Server();

		// Init transport
		this.transport = Jii.createObject(this.transport);
		this.transport.on(Jii.comet.server.transport.TransportInterface.EVENT_ADD_CONNECTION, this._onAddConnection.bind(this));
		this.transport.on(Jii.comet.server.transport.TransportInterface.EVENT_REMOVE_CONNECTION, this._onRemoveConnection.bind(this));
		this.transport.on(Jii.comet.server.transport.TransportInterface.EVENT_MESSAGE, this._onClientMessage.bind(this));
		this.transport.on(Jii.comet.server.transport.TransportInterface.EVENT_LOG, this._onLog.bind(this));
		this.transport.bindEngine(this._httpServer);
	},

	/**
	 * Start listen income comet connections
	 */
	start: function () {
		return Promise.all([
			this.__super(),
			new Promise(function(resolve) {
				this._httpServer.listen(this.port, this.host, function() {
					resolve();
				});
			}.bind(this))
		]);
	},

	/**
	 * Abort current connections and stop listen income comet connections
	 */
	stop: function() {
		return Promise.all([
			this.__super(),
			this.transport.destroy(Jii._.values(this._connections)),
			new Promise(function(resolve) {
				this._httpServer.close(function() {
					resolve();
				});
			}.bind(this))
		]);
	},

	/**
	 *
	 * @returns {{string: Jii.comet.server.Connection}}
	 */
	getConnections: function() {
		return this._connections;
	},

	/**
	 *
	 * @param {string[]} channel
	 */
	getChannelConnectionUids: function(channel) {
		return Jii._.keys(this._subscribes[channel] || {});
	},

	/**
	 * @param {string} connectionUid
	 * @returns {string[]}
	 */
	getConnectionChannels: function(connectionUid) {
		var channels = [];
		Jii._.each(this._subscribes, function(connections, channel) {
			if (connections[connectionUid]) {
				channels.push(channel);
			}
		});
		return channels;
	},

	/**
	 * @param {String} connectionId
	 * @param {String} channel
	 */
	subscribe: function(connectionId, channel) {
		var connection = this._connections[connectionId];
		if (!connection) {
			return;
		}

		if (!this._subscribes[channel]) {
			this._subscribes[channel] = {};
		}
		if (!this.hasChannelHandlers(channel)) {
			this.hub.subscribe(channel);
		}
		this._subscribes[channel][connectionId] = true;
	},

	/**
	 * @param {String} connectionId
	 * @param {String} channel
	 */
	unsubscribe: function(connectionId, channel) {
		// Delete connection
		if (this._subscribes[channel]) {
			delete this._subscribes[channel][connectionId];
		}

		// Delete subscribe, if no connections
		if (Jii._.isEmpty(this._subscribes[channel])) {
			delete this._subscribes[channel];
		}
		if (!this.hasChannelHandlers(channel)) {
			this.hub.unsubscribe(channel);
		}
	},

	/**
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	hasChannelHandlers: function(name) {
		return this.__super(name) || !Jii._.isEmpty(this._subscribes[name]);
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

		var connection = this._connections[id];
		if (connection) {
            Jii.trace('Comet server send to connection `' + id + '` data: ' + message);
			this.transport.send(connection, message);
		} else {
			this.__super(id, message);
		}
	},

	/**
	 * Store client connection
	 * @param {Jii.comet.server.ConnectionEvent} event
	 * @private
	 */
	_onAddConnection: function (event) {
		Jii.trace('User connected, connection id: `' + event.connection.id + '`');

		this._connections[event.connection.id] = event.connection;

		this.hub.subscribe(this.__static.CHANNEL_NAME_CONNECTION + event.connection.id);
		this.trigger(this.__static.EVENT_ADD_CONNECTION, event);
	},

	/**
	 * Remove client connection from store
	 * @param {Jii.comet.server.ConnectionEvent} event
	 * @private
	 */
	_onRemoveConnection: function (event) {
		Jii.trace('User disconnected, connection id: `' + event.connection.id + '`');

		// Unsubscribe from all subscribed channels
		for (var channel in this._subscribes) {
			if (this._subscribes.hasOwnProperty(channel)) {
				this.unsubscribe(event.connection.id, channel);
			}
		}

		// Remove connection
		delete this._connections[event.connection.id];

		this.hub.unsubscribe(this.__static.CHANNEL_NAME_CONNECTION + event.connection.id);
		this.trigger(this.__static.EVENT_REMOVE_CONNECTION, event);
	},

	/**
	 * Income messages from clients (browsers, ..)
     * @param {Jii.comet.server.MessageEvent} event
	 * @private
	 */
	_onClientMessage: function (event) {
		if (event.message.indexOf('channel ') === 0) {
			var channelMessage = event.message.substr(8);
			var channel = channelMessage.split(' ', 1)[0];
			var message = channelMessage.substr(channel.length + 1);

			this.hub.send(channel, message);
			this.hub.send(this.__static.CHANNEL_NAME_ALL, channel + ' ' + message);
		}

		if (event.message.indexOf('action ') === 0) {
			var actionMessage = event.message.substr(7);
			var route = actionMessage.split(' ', 1)[0];
			var jsonString = actionMessage.substr(route.length + 1) || '{}';

			this.pushActionToQueue(event.connection, route, JSON.parse(jsonString));
		}

		if (event.message.indexOf('subscribe ') === 0) {
			this.subscribe(event.connection.id, event.message.substr(10));
		}
		if (event.message.indexOf('unsubscribe ') === 0) {
			this.unsubscribe(event.connection.id, event.message.substr(12));
		}
	},

	/**
	 *
	 * @param {Jii.comet.LogEvent} event
	 * @private
	 */
	_onLog: function(event) {
		// @todo Jii.getLogger().log(message, Logger.LEVEL_TRACE, category);
		Jii.info(event.level + ': ' + event.message);
	},

	/**
	 * Income message from hub
	 * @param {Jii.comet.ChannelEvent} event
	 * @private
	 */
	_onHubMessage: function (event) {
		if (event.channel.indexOf(this.__static.CHANNEL_NAME_CONNECTION) === 0) {
			var connectionId = event.channel.substr(this.__static.CHANNEL_NAME_CONNECTION.length);
			var connection = this._connections[connectionId];
			if (connection) {
				this.transport.send(connection, event.message);
			}
			return;
		}

		this.__super(event);

		if (this._subscribes[event.channel]) {
			for (var connectionId2 in this._subscribes[event.channel]) {
				if (this._subscribes[event.channel].hasOwnProperty(connectionId2)) {
					this.sendToConnection(connectionId2, ['channel', event.channel, event.message].join(' '));
				}
			}
		}
	}

});
