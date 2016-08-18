'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.comet.server.queue.QueueInterface
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.comet.server.queue.QueueInterface', /** @lends Jii.comet.server.queue.QueueInterface.prototype */{

	__extends: 'Jii.base.Component',

	/**
	 * Start queue
	 */
	start() {

	},

	/**
	 * Stop queue
	 */
	stop() {

	},

	/**
	 * Add message to queue
	 * @param message
	 */
	push(message) {
	},

	/**
	 * Get and remove message from queue
	 * @returns Promise
	 */
	pop() {
	}

});