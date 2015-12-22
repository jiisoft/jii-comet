'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('./QueueInterface');

var redis = require("redis");

/**
 * @class Jii.comet.server.queue.Redis
 * @extends Jii.comet.server.queue.QueueInterface
 */
Jii.defineClass('Jii.comet.server.queue.Redis', /** @lends Jii.comet.server.queue.Redis.prototype */{

	__extends: 'Jii.comet.server.queue.QueueInterface',

	__static: /** @lends Jii.comet.server.HubServer */{

		/**
		 * @type {string}
		 */
		KEY: '__queueZCw4l7'

	},

	/**
	 * @type {string}
	 */
	host: '127.0.0.1',

	/**
	 * @type {number}
	 */
	port: 6379,

	/**
	 * @type {string}
	 */
	password: null,

	/**
	 * @type {RedisClient}
	 */
	_engine: null,

	init: function() {
	},

	start: function() {
		var options = {};
		if (this.password !== null) {
			options.auth_pass = this.password;
		}

		this._engine = redis.createClient(this.port, this.host, options);
		return new Promise(function(resolve) {
			if (this._engine.connected) {
				resolve();
				return;
			}

			var onConnect = function() {
				this._engine.removeListener('connect', onConnect);
				resolve();
			}.bind(this);
			this._engine.on('connect', onConnect)
		}.bind(this));
	},

	/**
	 * Stop queue
	 */
	stop: function() {
		return new Promise(function(resolve) {
			var onClose = function() {
				this._engine.removeListener('close', onClose);
				resolve();
			}.bind(this);
			this._engine.on('close', onClose);
			this._engine.end();
		}.bind(this));
	},

	/**
	 * Add message to queue
	 * @param {string} message
	 */
	push: function(message) {
		return new Promise(function(resolve, reject) {
			this._engine.rpush(this.__static.KEY, message, function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		}.bind(this));
	},

	/**
	 * Get and remove message from queue
	 * @returns Promise
	 */
	pop: function() {
		return new Promise(function(resolve, reject) {
			this._engine.lpop(this.__static.KEY, function(err, message) {
				if (err) {
					reject(err);
				} else {
					resolve(message || null);
				}
			});
		}.bind(this));
	}

});