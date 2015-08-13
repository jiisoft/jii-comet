
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

	/**
	 * Start hub
	 */
	start: function() {
		var options = {};
		if (this.password !== null) {
			options.auth_pass = this.password;
		}

		this._hub = redis.createClient(this.port, this.host, options);
		this._subscriber = redis.createClient(this.port, this.host, options);

		return Promise.all([
			// connect hub
			new Promise(function(resolve) {
				if (this._hub.connected) {
					resolve();
					return;
				}

				var onConnect = function() {
					this._hub.removeListener('connect', onConnect);
					resolve();
				}.bind(this);
				this._hub.on('connect', onConnect)
			}.bind(this)),

			// connect subscriber
			new Promise(function(resolve) {
				if (this._subscriber.connected) {
					resolve();
					return;
				}

				var onConnect = function() {
					this._subscriber.removeListener('connect', onConnect);
					resolve();
				}.bind(this);
				this._subscriber.on('connect', onConnect)
			}.bind(this))
		]).then(function() {

			// do subscribe
			this._subscriber.on('message', this._onHubMessage.bind(this));
		}.bind(this));
	},

	/**
	 * End hub
	 */
	stop: function() {
		return Promise.all([
			new Promise(function(resolve) {
				var onClose = function() {
					this._hub.removeListener('close', onClose);
					resolve();
				}.bind(this);
				this._hub.on('close', onClose);
				this._hub.end();
			}.bind(this)),
			new Promise(function(resolve) {
				var onClose = function() {
					this._subscriber.removeListener('close', onClose);
					resolve();
				}.bind(this);
				this._subscriber.on('close', onClose);
				this._subscriber.end();
			}.bind(this))
		]);
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
		this.trigger(this.__static.EVENT_MESSAGE, new Jii.comet.ChannelEvent({
			channel: channel,
			message: message
		}));
	}

});