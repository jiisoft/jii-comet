
'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('./HubInterface');

var redis = require("redis")

/**
 * @class Jii.comet.server.hub.Redis
 * @extends Jii.comet.server.hub.HubInterface
 */
Jii.defineClass('Jii.comet.server.hub.Redis', /** @lends Jii.comet.server.hub.Redis.prototype */{

	__extends: Jii.comet.server.hub.HubInterface,

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
	_hub: null,

	/**
	 * @type {RedisClient}
	 */
	_subscriber: null,

	init: function() {
		var options = {};
		if (this.password !== null) {
			options.auth_pass = this.password;
		}

		this._hub = redis.createClient(this.port, this.host, options);
		this._subscriber = redis.createClient(this.port, this.host, options);
	},

	/**
	 * Start hub
	 */
	start: function() {
		this._hub.on('message', this._onHubMessage.bind(this));
	},

	/**
	 * End hub
	 */
	end: function() {
		this._hub.end();
		this._subscriber.end();
	},

	/**
	 * Send message to channel
	 * @param {string} channel
	 * @param {string} message
	 */
	send: function(channel, message) {
		this._hub.publish(channel, message);
	},

	/**
	 * Subscribe to channel
	 * @param {string} channel
	 */
	subscribe: function(channel) {
		this._subscriber.subscribe(channel);
	},

	/**
	 * Unsubscribe from channel
	 * @param {string} channel
	 */
	unsubscribe: function(channel) {
		this._subscriber.unsubscribe(channel);
	},

	_onHubMessage: function(channel, message) {
		this.trigger(this.__static.EVENT_MESSAGE, channel, message);
	}

});