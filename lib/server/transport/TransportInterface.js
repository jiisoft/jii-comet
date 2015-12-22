
'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.comet.server.transport.TransportInterface
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.comet.server.transport.TransportInterface', /** @lends Jii.comet.server.transport.TransportInterface.prototype */{

	__extends: 'Jii.base.Component',

	__static: /** @lends Jii.comet.server.transport.TransportInterface */{

		/**
		 * @event Jii.comet.server.transport.TransportInterface#addConnection
		 * @property {Jii.comet.server.transport.ConnectionEvent} event
		 */
		EVENT_ADD_CONNECTION: 'addConnection',

		/**
		 * @event Jii.comet.server.transport.TransportInterface#removeConnection
		 * @property {Jii.comet.server.transport.ConnectionEvent} event
		 */
		EVENT_REMOVE_CONNECTION: 'removeConnection',

		/**
		 * @event Jii.comet.server.transport.TransportInterface#message
		 * @property {Jii.comet.server.MessageEvent} event
		 */
		EVENT_MESSAGE: 'message',

		/**
		 * @event Jii.comet.server.transport.TransportInterface#log
		 * @property {Jii.comet.LogEvent} event
		 */
		EVENT_LOG: 'log'

	},

	/**
	 * @param {Server} httpServer
	 */
	bindEngine: function(httpServer) {

	},

	/**
	 *
	 * @param {object} connection
	 * @return {{headers: object, ip: string, remotePort: number}}
	 */
	parseRequest: function(connection) {

	},

	/**
	 *
	 * @param {object} connection
	 * @param {string} message
	 */
	send: function(connection, message) {

	},

	/**
	 *
	 * @param {object[]} connections
	 */
	destroy: function(connections) {

	}

});