'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

// sockjs global fix: sockjs expect that global object is equal window, but it is not always, for example in node-webkit
if (typeof global !== 'undefined' && typeof window !== 'undefined' && global !== window) {
    var usedWindowKeys = ['document', 'location', 'XMLHttpRequest', 'EventSource', 'WebSocket', 'MozWebSocket',
        'XDomainRequest', 'crypto', 'navigator', 'chrome', 'addEventListener', 'attachEvent',
        'removeEventListener', 'detachEvent', 'parent', 'postMessage', 'console'];
    Jii._.each(usedWindowKeys, function(key) {
        global[key] = window[key];
    });
}
// @todo jsonp callbacks

var SockJS = require('sockjs-client');

/**
 * @class Jii.comet.client.transport.Sockjs
 * @extends Jii.comet.client.transport.TransportInterface
 */
Jii.defineClass('Jii.comet.client.transport.Sockjs', /** @lends Jii.comet.client.transport.Sockjs.prototype */{

	__extends: 'Jii.comet.client.transport.TransportInterface',

    /**
     * Available:
     * - websocket
     * - xdr-polling
     * - xdr-streaming
     * - xhr-polling
     * - xhr-streaming
     * - eventsource
     * - htmlfile
     * - iframe
     * - jsonp-polling
     */
    transports: null,

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
            transports: this.transports
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