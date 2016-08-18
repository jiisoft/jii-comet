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

	__extends: 'Jii.comet.server.transport.TransportInterface',

	__static: /** @lends Jii.comet.server.transport.SockJs */{

		LOG_LEVEL_MAPPING: {
			debug: 'debug',
			info: 'debug',
			error: 'error'
		}

	},

	urlPrefix: '/comet',

	_server: null,

	init() {
		this.__super();

		this._server = SockJS.createServer({
			log : (severity, message) => {
				this.trigger(this.__static.EVENT_LOG, new Jii.comet.LogEvent({
					level: this.__static.LOG_LEVEL_MAPPING[severity] || 'debug',
					message: message
				}));
			}
		});

		this._server.on('connection', this._addConnection.bind(this));
	},

	/**
	 * @param {Server} httpServer
	 */
	bindEngine(httpServer) {
		this._server.installHandlers(httpServer, {
			prefix: this.urlPrefix
		});
	},

	/**
	 *
	 * @param {Jii.comet.server.Connection} connection
	 * @param {string} message
	 */
	send(connection, message) {
		connection.originalConnection.write(message);
	},

	/**
	 *
	 * @param {Jii.comet.server.Connection[]} connections
	 */
	destroy(connections) {
		connections.forEach(connection => {
			connection.originalConnection.destroy();
		});
	},

	_addConnection(originalConnection) {
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
        originalConnection.on('data', message => {
			this.trigger(this.__static.EVENT_MESSAGE, new Jii.comet.server.MessageEvent({
				connection: connection,
				message: message
			}));
		});

		// Trigger remove connection on close
        originalConnection.on('close', () => {
			this.trigger(this.__static.EVENT_REMOVE_CONNECTION, new Jii.comet.server.ConnectionEvent({
				connection: connection
			}));
		});

		// Trigger add new connection
		this.trigger(this.__static.EVENT_ADD_CONNECTION, new Jii.comet.server.ConnectionEvent({
			connection: connection
		}));
	}

});