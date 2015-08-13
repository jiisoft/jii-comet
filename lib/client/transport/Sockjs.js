'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var SockJS = require('sockjs-client');

/**
 * @class Jii.comet.client.transport.Sockjs
 * @extends Jii.comet.client.transport.TransportInterface
 */
Jii.defineClass('Jii.comet.client.transport.Sockjs', /** @lends Jii.comet.client.transport.Sockjs.prototype */{

	__extends: Jii.comet.client.transport.TransportInterface,

	protocols: null,

	/**
	 * @type {SockJS}
	 */
	_websocket: null,

	/**
	 * Open connection
	 * @param {string} url
	 */
	open: function(url) {
		this._websocket = new SockJS(url, null, {
			//debug: HelpOnClick.debug,
			protocols_whitelist: this.protocols
		});

		this._websocket.onopen = this._onOpen.bind(this);
		this._websocket.onmessage = this._onMessage.bind(this);
		this._websocket.onclose = this._onClose.bind(this);
	},

	/**
	 * Close connection
	 */
	close: function() {
		if (this._websocket) {
			this._websocket.close();
			this._websocket = null;
		}
	},

	/**
	 * Send message to server
	 * @param {string} message
	 */
	send: function(message) {
		if (this._websocket) {
			this._websocket.send(message);
		}
	},

	_onOpen: function() {
		this.trigger(this.__static.EVENT_OPEN, new Jii.base.Event());
	},

	_onClose: function(errorEvent) {
		this.trigger(this.__static.EVENT_CLOSE, new Jii.base.Event());
	},

	_onMessage: function (event) {
		if (event.type === 'message') {
			this.trigger(this.__static.EVENT_MESSAGE, new Jii.comet.client.MessageEvent({
				message: event.data
			}));
		}
	}

});