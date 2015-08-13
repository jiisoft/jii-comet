
'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.comet.server.hub.HubInterface
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.comet.server.hub.HubInterface', /** @lends Jii.comet.server.hub.HubInterface.prototype */{

	__extends: Jii.base.Component,

	__static: /** @lends Jii.comet.server.hub.HubInterface */{

		/**
		 * @event Jii.comet.server.hub.HubInterface#message
		 * @property {Jii.comet.ChannelEvent} event
		 */
		EVENT_MESSAGE: 'message'

	},

	/**
	 * Start hub
	 */
	start: function() {

	},

	/**
	 * Stop hub
	 */
	stop: function() {

	},

	/**
	 * Send message to channel
	 * @param {string} channel
	 * @param {string} message
	 */
	send: function(channel, message) {

	},

	/**
	 * Subscribe to channel
	 * @param {string} channel
	 */
	subscribe: function(channel) {

	},

	/**
	 * Unsubscribe from channel
	 * @param {string} channel
	 */
	unsubscribe: function(channel) {

	}


});