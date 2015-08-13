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

require('./ConnectionEvent');

/**
 * @class Jii.comet.server.NeatCometAdapter
 * @extends Jii.base.Object
 * @implements NeatComet.api.ICometServer
 */
Jii.defineClass('Jii.comet.server.NeatCometAdapter', /** @lends Jii.comet.server.NeatCometAdapter.prototype */{

	__extends: Jii.base.Object,

	__static: {

		ROUTE_PREFIX: 'profiles:'

	},

	/**
	 * @type {Jii.comet.server.Server}
	 **/
	comet: null,

	/**
	 * Allowed to expect that it will be called only once per ICometServer instance
	 * @param {NeatComet.api.ICometServerEvents} eventsHandler
	 */
	bindServerEvents: function(eventsHandler) {
		this.comet.on(Jii.comet.server.Server.EVENT_ADD_CONNECTION, function(event) {
			eventsHandler.onNewConnection(event.connection.id);
		});
		this.comet.on(Jii.comet.server.Server.EVENT_REMOVE_CONNECTION, function(event) {
			eventsHandler.onLostConnection(event.connection.id);
		});
	},

	/**
	 * @param {String} channel
	 * @param {*} message
	 */
	broadcast: function(channel, message) {
		this.comet.sendToChannel(this.__static.ROUTE_PREFIX + channel, message);
	},

	/**
	 * @param {String} channel
	 * @param {Function} callback
	 */
	subscribe: function(channel, callback) {
		this.comet.on('channel:' + this.__static.ROUTE_PREFIX + channel, callback);
	},

	/**
	 * @param {String} channel
	 * @param {Function} callback
	 */
	unsubscribe: function(channel, callback) {
		this.comet.off('channel:' + this.__static.ROUTE_PREFIX + channel, callback);
	}

});
