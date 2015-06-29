
'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('./TransportInterface');

var sockjs = require('sockjs');

/**
 * @class Jii.comet.server.transport.SockJs
 * @extends Jii.comet.server.transport.TransportInterface
 */
Jii.defineClass('Jii.comet.server.transport.SockJs', /** @lends Jii.comet.server.transport.SockJs.prototype */{

	__extends: Jii.comet.server.transport.TransportInterface,

	__static: /** @lends Jii.comet.server.transport.SockJs */{

		LOG_LEVEL_MAPPING: {
			debug: 'debug',
			info: 'debug',
			error: 'error'
		}

	},

	_server: null,

	init: function() {
		this.__super();

		this._server = sockjs.createServer({
			log: function(severity, message) {
				this.trigger(this.__static.EVENT_LOG, this.__static.LOG_LEVEL_MAPPING[severity] || debug, message);
			}.bind(this)
		});

		this._server.on('connection', this._addConnection.bind(this));
	},

	/**
	 * @param {Server} httpServer
	 */
	bindEngine: function(httpServer) {
		this._server.installHandlers(httpServer/*, {prefix: this.urlPrefix}*/);
	},

	/**
	 *
	 * @param {object} connection
	 * @return {{headers: object, ip: string, remotePort: number}}
	 */
	parseRequest: function(connection) {
		return {
			headers: connection.headers,
			ip: connection.ip,
			remotePort: connection.remotePort
		};
	},

	/**
	 *
	 * @param {object} connection
	 * @param {string} message
	 */
	send: function(connection, message) {
		connection.write(message);
	},

	/**
	 *
	 * @param {object[]} connections
	 */
	destroy: function(connections) {
		connections.forEach(function(connection) {
			connection.destroy();
		});
	},

	_addConnection: function(connection) {
		// Trigger on incoming message
		connection.on('data', function (message) {
			this.trigger(this.__static.EVENT_MESSAGE, connection.id, connection, message);
		}.bind(this));

		// Trigger remove connection on close
		connection.on('close', function () {
			this.trigger(this.__static.EVENT_REMOVE_CONNECTION, connection.id);
		}.bind(this));

		// Trigger add new connection
		this.trigger(this.__static.EVENT_ADD_CONNECTION, connection.id, connection);
	}

});