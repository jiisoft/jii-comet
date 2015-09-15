'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('./TransportInterface');

var SockJS = require('sockjs');

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

	urlPrefix: '/comet',

	_server: null,

	init: function() {
		this.__super();

		this._server = SockJS.createServer({
			log: function(severity, message) {
				this.trigger(this.__static.EVENT_LOG, new Jii.comet.LogEvent({
					level: this.__static.LOG_LEVEL_MAPPING[severity] || 'debug',
					message: message
				}));
			}.bind(this)
		});

		this._server.on('connection', this._addConnection.bind(this));
	},

	/**
	 * @param {Server} httpServer
	 */
	bindEngine: function(httpServer) {
		this._server.installHandlers(httpServer, {
			prefix: this.urlPrefix
		});
	},

	/**
	 *
	 * @param {Jii.comet.server.Connection} connection
	 * @param {string} message
	 */
	send: function(connection, message) {
		connection.originalConnection.write(message);
	},

	/**
	 *
	 * @param {Jii.comet.server.Connection[]} connections
	 */
	destroy: function(connections) {
		connections.forEach(function(connection) {
			connection.originalConnection.destroy();
		});
	},

	_addConnection: function(originalConnection) {
		var connection = new Jii.comet.server.Connection({
			id: originalConnection.id,
			originalConnection: originalConnection,
			request: new Jii.comet.server.Request({
				headers: originalConnection.headers,
				ip: originalConnection.ip,
				port: originalConnection.remotePort
			})
		});

		// Trigger on incoming message
        originalConnection.on('data', function (message) {
			this.trigger(this.__static.EVENT_MESSAGE, new Jii.comet.server.MessageEvent({
				connection: connection,
				message: message
			}));
		}.bind(this));

		// Trigger remove connection on close
        originalConnection.on('close', function () {
			this.trigger(this.__static.EVENT_REMOVE_CONNECTION, new Jii.comet.server.ConnectionEvent({
				connection: connection
			}));
		}.bind(this));

		// Trigger add new connection
		this.trigger(this.__static.EVENT_ADD_CONNECTION, new Jii.comet.server.ConnectionEvent({
			connection: connection
		}));
	}

});