
'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('./TransportInterface');

var socketIo = require('socket.io');

/**
 * @class Jii.comet.server.transport.SocketIo
 * @extends Jii.comet.server.transport.TransportInterface
 */
Jii.defineClass('Jii.comet.server.transport.SocketIo', /** @lends Jii.comet.server.transport.SocketIo.prototype */{

	__extends: 'Jii.comet.server.transport.TransportInterface',

	/**
	 * @param {Server} httpServer
	 */
	bindEngine: function(httpServer) {
		var server = socketIo(httpServer);
		server.on('connection', this._addConnection.bind(this));

		// Init redis
		//server.adapter(require('socket.io-redis')({ host: this.redisHost, port: this.redisPort}));
	},

	/**
	 *
	 * @param {object} connection
	 * @return {{headers: object, ip: string, remotePort: number}}
	 */
	parseRequest: function(connection) {
		return {
			headers: connection.conn.request.headers,
			ip: connection.request.connection.remoteAddress,
			remotePort: connection.request.connection.remotePort
		};
	},

	/**
	 *
	 * @param {object} connection
	 * @param {string} message
	 */
	send: function(connection, message) {
		socket.emit([message]);
	},

	/**
	 *
	 * @param {object[]} connections
	 */
	destroy: function(connections) {
		connections.forEach(function(connection) {
			// @todo abort connection
		});
	},

	_addConnection: function(connection) {
		// Trigger on incoming message
		connection.conn.on('data', function(event) {
			if (event.charAt(0) !== "2") {
				return;
			}

			var message = event.substr(3, event.length - 5);
			message = JSON.parse(message);
			//message = message.replace(/\\"/g, '"');

			this.trigger(this.__static.EVENT_MESSAGE, connection.id, connection, message);
		}.bind(this));

		// Trigger remove connection on close
		connection.on('disconnect', function () {
			this.trigger(this.__static.EVENT_REMOVE_CONNECTION, connection.id);
		}.bind(this));

		// Trigger add new connection
		this.trigger(this.__static.EVENT_ADD_CONNECTION, connection.id, connection);
	}

});