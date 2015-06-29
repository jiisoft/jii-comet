
'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.comet.server.transport.TransportInterface
 * @extends Jii.base.Object
 */
Jii.defineClass('Jii.comet.server.transport.TransportInterface', /** @lends Jii.comet.server.transport.TransportInterface.prototype */{

	__extends: Jii.base.Object,

	__static: /** @lends Jii.comet.server.transport.TransportInterface */{

		/**
		 * @event Jii.comet.server.transport.TransportInterface#addConnection
		 * @property {string} Connection id
		 * @property {object} Connection instance (socket)
		 */
		EVENT_ADD_CONNECTION: 'addConnection',

		/**
		 * @event Jii.comet.server.transport.TransportInterface#removeConnection
		 * @property {string} Connection id
		 */
		EVENT_REMOVE_CONNECTION: 'removeConnection',

		/**
		 * @event Jii.comet.server.transport.TransportInterface#message
		 * @property {string} Connection id
		 * @property {object} Connection instance (socket)
		 * @property {string} Message
		 */
		EVENT_MESSAGE: 'message',

		/**
		 * @event Jii.comet.server.transport.TransportInterface#log
		 * @property {string} Level: debug/info/warning/error
		 * @property {string} Log message
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