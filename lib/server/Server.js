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
 * @class Jii.comet.server.BaseServer
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.comet.server.BaseServer', /** @lends Jii.comet.server.BaseServer.prototype */{

	__extends: Jii.base.Component,

	/**
	 * @type {string}
	 */
	host: null,

	/**
	 * @type {number}
	 */
	port: null,

	/**
	 * @type {Jii.comet.hub.HubInterface}
	 */
	hub: {
		className: 'Jii.comet.hub.Redis'
	},

	/**
	 * @type {Jii.comet.server.transport.TransportInterface}
	 */
	transport: {
		className: 'Jii.comet.transport.SockJs'
	},

	/**
	 * @type {string}
	 */
	_serverUid: null,

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

		// Generate unique server uid
		this._serverUid = Jii.helpers.String.generateUid();

		// Create http server
		this._httpServer = require('http').Server();

		// Init hub
		this.hub = Jii.createObject(this.hub);
		this.hub.on(Jii.comet.hub.HubInterface.EVENT_MESSAGE, this._hubMessage.bind(this));

		// Init transport
		this.transport = Jii.createObject(this.transport);
		this.transport.bindEngine(this._httpServer);
		this.transport.on(Jii.comet.server.transport.TransportInterface.EVENT_ADD_CONNECTION, this._addConnection.bind(this));
		this.transport.on(Jii.comet.server.transport.TransportInterface.EVENT_REMOVE_CONNECTION, this._removeConnection.bind(this));
		this.transport.on(Jii.comet.server.transport.TransportInterface.EVENT_MESSAGE, this._clientMessage.bind(this));
	},

	/**
	 * Start listen income comet connections
	 */
	start: function () {
		this.hub.start();
		this._httpServer.listen(this.port || 3100, this.host || '0.0.0.0');
	},

	/**
	 * Abord current connections and stop listen income comet connections
	 */
	stop: function() {
		this.hub.stop();
		this.transport.destroy(Jii._.values(this._connections));
	},

	/**
	 * Send data to channel
	 * @param {string} channel
	 * @param {*} data
	 */
	send: function (channel, data) {
		if (typeof data !== 'string') {
			data = JSON.stringify(data);
		}

		Jii.trace('Comet server send to channel `' + channel + '` data: ' + data);
		this.hub.send(channel, data);
	},

	/**
	 * Store client connection
	 * @param {string} id
	 * @param {object} connection
	 * @private
	 */
	_addConnection: function (id, connection) {
		Jii.trace('User connected, connection uid: `' + id + '`');

		this._connections[id] = connection;
	},

	/**
	 * Remove client connection from store
	 * @param {object} id
	 * @private
	 */
	_removeConnection: function (id) {
		Jii.trace('User disconnected, connection uid: `' + id + '`');

		// Unsubscribe from connection subscribed channels
		/*_.each(this._subscribes, function(connectionIds, channel) {
			if (_.indexOf(connectionIds, id) !== -1) {
				this._commands.unsubscribe.call(this, id, channel);
			}
		}.bind(this));*/

		// Remove connection
		delete this._connections[id];
	},

	/**
	 * Income messages from clients (browsers, ..)
	 * Data formats:
	 *  - init {json...
     *  - message channel {json...
     * @param {object} connection
	 * @param {string} data
	 * @private
	 */
	_clientMessage: function (connection, data) {
		var i = data.indexOf(' ');
		var command = data.substr(0, i);

		Jii.app.logger.debug('Comet client income:', data);

		// Run command
		if (this._commands[command]) {
			var message = data.substr(i + 1);
			this._commands[command].call(this, connection, message);
		}
	},

	/**
	 * @param {String} connectionUid
	 * @param {String} channel
	 */
	subscribe: function(connectionUid, channel) {

		var connection = this._connections[connectionUid];
		if (!connection) {
			return;
		}

		// Make compatible with client
		channel = channel.replace(/^channel:/, '');

		this._clientMessage(connection, 'subscribe ' + channel);
	},

	/**
	 * @param {String} connectionUid
	 * @param {String} channel
	 */
	unsubscribe: function(connectionUid, channel) {

		var connection = this._connections[connectionUid];
		if (!connection) {
			return;
		}

		this._clientMessage(connection, 'unsubscribe ' + channel);
	},

	_commands: {
		/**
		 * Run server action by client
		 * @param {object} connection
		 * @param {string} message
		 */
		action: function (connection, message) {
			/*var i = message.indexOf(' ');
			var path = message.substr(0, i);
			var params = JSON.parse(message.substr(i + 1));

			// Get route
			var routeInfo = this._expressRouter.match('get', path);
			if (!routeInfo) {
				throw new Jii.exceptions.ApplicationException('Path `' + path + '` is not registered in config.');
			}
			routeInfo.url = path;

			var request = this.transport.parseRequest(connection);
			request.query = params;
			request.query.connectionUid = connection.id;
			request.query.routeInfo = routeInfo;

			this.runAction(this.routes[routeInfo.path], request).always(function(action) {
				Joints.when(action.deferred).always(function() {
					var connectionUid = action.params.connectionUid;
					var requestUid = action.params.requestUid;
					var connection = this._connections[connectionUid];

					if (connection && requestUid) {
						action.data = action.data || {};
						action.data.requestUid = requestUid;
						this.transport.send(connection, 'action ' + JSON.stringify(action.data));
					}
				}.bind(this));
			}.bind(this));*/
		},

		/**
		 * Subscribe client from channel
		 * @param {object} connection
		 * @param {string} channel
		 */
		subscribe: function (connection, channel) {
			if (!this._subscribes[channel]) {
				this._subscribes[channel] = [];

				// Check already subscribe
				if (_.indexOf(this._subscribes[channel], connection.id) !== -1) {
					return;
				}

				this.hub.subscribe(channel);
			}

			this._subscribes[channel].push(connection.id);
		},

		/**
		 * Send client message to redis hub
		 * @param {object} connection
		 * @param {string} message
		 */
		message: function (connection, message) {
			var i = message.indexOf(' ');
			var channel = message.substr(0, i);
			var data = message.substr(i + 1);

			this.hub.send(channel, data);
		},

		/**
		 * Unsubscribe client from channel
		 * @param {object} id
		 * @param {string} channel
		 */
		unsubscribe: function (id, channel) {
			// Delete connection
			if (this._subscribes[channel]) {
				var i = _.indexOf(this._subscribes[channel], id);
				delete this._subscribes[channel][i];
			}

			// Delete subscribe, if no connections
			if (!this._subscribes[channel]) {
				delete this._subscribes[channel];
				this.hub.unsubscribe(channel);
			}
		}
	},

	/**
	 * Income message from redis hub
	 * @param {string} channel
	 * @param {string} data
	 * @private
	 */
	_hubMessage: function (channel, data) {
		var i = data.indexOf(' ');
		var accessType = data.substr(0, i);
		var message = data.substr(i + 1);

		Jii.trace('Comet hub income, channel `' + channel + '`: ' + data);

		// TODO: Eliminate accessType from Comet at all. This is not the Comet server's layer of logic. Replace it with an ability to send into multiple channels at once

		switch (accessType) {
			// @todo
			/*case self.ACCESS_TYPE_ALL:
			 // Send message to all online users
			 _.each(this._connections, function(connection) {
			 connection.write(channel + ' ' + message);
			 }.bind(this));
			 break;*/

			case this.__static.ACCESS_TYPE_SUBSCRIBERS:
				// Send message to subscribers
				_.each(this._subscribes[channel] || [], function(connectionId) {
					var connection = this._connections[connectionId];
					if (connection) {
						this.trigger('hubMessage', channel, message, connectionId);
						this.this.transport.send(connection, 'channel ' + channel + ' ' + message);
					}
				}.bind(this));
				break;

			default: // users list
				_.each(accessType.split('|'), function(userUid) {
					// Get formatted user channel name
					var userChannel = this.__static._getUserChannel(userUid);

					// Find connections, who subscribe on user channel
					_.each(this._subscribes[userChannel] || [], function(connectionId) {
						var connection = this._connections[connectionId];
						if (connection) {
							this.trigger('hubMessage', channel, message, connectionId);
							this.this.transport.send(connection, 'channel ' + channel + ' ' + message);
						}
					}.bind(this));
				}.bind(this));
				break;
		}
	}

}, {

	_getUserChannel: function(userUid) {
		return this.USER_CHANNEL_PREFIX + userUid;
	},

	USER_CHANNEL_PREFIX: 'gtYqti-user-',
	REDIS_COMET_PREFIX: 'comet',

	ACCESS_TYPE_ALL: 'all',
	ACCESS_TYPE_SUBSCRIBERS: 'subscribers'

});
