'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('../../index');
require('./bootstrap');

var app = Jii.namespace('app');

/**
 * @class tests.unit.CometServerTest
 * @extends Jii.base.UnitTest
 */
var self = Jii.defineClass('tests.unit.CometServerTest', /** @lends tests.unit.CometServerTest.prototype */{

	__extends: 'Jii.base.UnitTest',

	__static: {
		SERVER_PORT: 3300
	},

	init: function() {
		Jii.app.setComponents({
			comet: {
				className: 'Jii.comet.server.Server',
				port: this.__static.SERVER_PORT
			},
			cometListener: {
				className: 'Jii.comet.server.HubServer'
			}
		});
	},

	setUp: function() {
		return Promise.all([
			Jii.app.comet.start(),
			Jii.app.cometListener.start(),
			this.__super()
		]);
	},

	tearDown: function() {
		return Promise.all([
			Jii.app.comet.stop(),
			Jii.app.cometListener.stop(),
			this.__super()
		]);
	},

	subscribeTest: function (test) {
		/** @typedef {Jii.comet.ChannelEvent} event */
		var event = null;
		Jii.app.comet.on(Jii.comet.server.Server.EVENT_CHANNEL, function(e) {
			event = e;
		});

		/** @typedef {Jii.comet.ChannelEvent} event */
		var event2 = null;
		Jii.app.comet.on(Jii.comet.server.Server.EVENT_CHANNEL_NAME + 'test', function(e) {
			event2 = e;
		});

		/** @typedef {Jii.comet.ChannelEvent} event */
		var event3 = null;
		Jii.app.comet.on(Jii.comet.server.Server.EVENT_CHANNEL_NAME + 'blabla', function(e) {
			event3 = e;
		});

		/** @typedef {Jii.comet.ChannelEvent} event */
		var hubEvent = null;
		Jii.app.comet.hub.on(Jii.comet.server.hub.HubInterface.EVENT_MESSAGE, function(e) {
			hubEvent = e;
		});

		setTimeout(function() {
			Jii.app.comet.sendToChannel('test', {foo: 588});

			test.strictEqual(true, Jii.app.comet.hasEventHandlers(Jii.comet.server.Server.EVENT_CHANNEL));
			test.strictEqual(true, Jii.app.comet.hasEventHandlers(Jii.comet.server.Server.EVENT_CHANNEL_NAME + 'test'));
			test.strictEqual(true, Jii.app.comet.hasEventHandlers(Jii.comet.server.Server.EVENT_CHANNEL_NAME + 'blabla'));
			test.strictEqual(false, Jii.app.comet.hasEventHandlers(Jii.comet.server.Server.EVENT_CHANNEL_NAME + 'qweqwe'));

			setTimeout(function() {
				test.strictEqual(event.channel, 'test');
				test.strictEqual(event.message, '{"foo":588}');

				test.notStrictEqual(event2, null);
				test.strictEqual(event2.channel, 'test');
				test.strictEqual(event2.message, '{"foo":588}');

				test.strictEqual(event3, null);

				test.notStrictEqual(hubEvent, null);
				test.strictEqual(hubEvent.message, 'test {"foo":588}');

				// Reset and unsubscribe
				event = null;
				event2 = null;
				hubEvent = null;
				Jii.app.comet.off(Jii.comet.server.Server.EVENT_CHANNEL);
				Jii.app.comet.off(Jii.comet.server.Server.EVENT_CHANNEL_NAME + 'test');

				test.strictEqual(false, Jii.app.comet.hasEventHandlers(Jii.comet.server.Server.EVENT_CHANNEL));
				test.strictEqual(false, Jii.app.comet.hasEventHandlers(Jii.comet.server.Server.EVENT_CHANNEL_NAME + 'test'));
				test.strictEqual(true, Jii.app.comet.hasEventHandlers(Jii.comet.server.Server.EVENT_CHANNEL_NAME + 'blabla'));

				Jii.app.comet.sendToChannel('test', {foo: 444});

				setTimeout(function() {
					test.strictEqual(event, null);
					test.strictEqual(event2, null);
					test.strictEqual(hubEvent, null);

					test.done();
				}, 10);
			}, 10);
		}, 10);
	},

	pushActionToSelfTest: function(test) {
		Jii.app.comet.hub.subscribe(Jii.comet.server.HubServer.CHANNEL_NAME_ACTION);
		Jii.app.cometListener.hub.unsubscribe(Jii.comet.server.HubServer.CHANNEL_NAME_ACTION);

		var incomeMessage = null;
		var connection = this._createConnection(function(m) { incomeMessage = m });

		// Subscribe
		var event = null;
		Jii.app.comet.on(Jii.comet.server.HubServer.EVENT_MESSAGE, function(e) {
			event = e;
		});

		// Client connect
		Jii.app.comet.transport.trigger(Jii.comet.server.transport.TransportInterface.EVENT_ADD_CONNECTION, new Jii.comet.server.ConnectionEvent({
			connection: connection
		}));

		// Client send command for run action
		Jii.app.comet.transport.trigger(Jii.comet.server.transport.TransportInterface.EVENT_MESSAGE, new Jii.comet.server.MessageEvent({
			connection: connection,
			message: 'action site/test'
		}));

		setTimeout(function() {
			test.notStrictEqual(event, null);

			test.strictEqual(event.channel, Jii.comet.server.HubServer.CHANNEL_NAME_ACTION);
			test.strictEqual(event.message, 'site/test');
			test.strictEqual(incomeMessage, 'action "test1test"');

			test.done();
		}, 50);
	},

	pushActionViaHubTest: function(test) {
		Jii.app.comet.hub.unsubscribe(Jii.comet.server.HubServer.CHANNEL_NAME_ACTION);
		Jii.app.cometListener.hub.subscribe(Jii.comet.server.HubServer.CHANNEL_NAME_ACTION);

		var incomeMessage = null;
		var connection = this._createConnection(function(m) { incomeMessage = m });

		// Client connect
		Jii.app.comet.transport.trigger(Jii.comet.server.transport.TransportInterface.EVENT_ADD_CONNECTION, new Jii.comet.server.ConnectionEvent({
			connection: connection
		}));

		// Client send command for run action
		Jii.app.comet.transport.trigger(Jii.comet.server.transport.TransportInterface.EVENT_MESSAGE, new Jii.comet.server.MessageEvent({
			connection: connection,
			message: 'action site/test2'
		}));

		setTimeout(function() {
			test.strictEqual(incomeMessage, 'action "test2test"');

			test.done();
		}, 50);
	},

	_createConnection: function(handler) {
		return new Jii.comet.server.Connection({
			id: Jii.helpers.String.generateUid(),
			originalConnection: { write: handler, destroy: function() {} },
			request: new Jii.comet.server.Request({
				headers: {},
				ip: '127.0.0.1',
				port: Jii.app.comet.port
			})
		});
	}

});

Jii.defineClass('app.controllers.SiteController', {

	__extends: 'Jii.base.Controller',

	actionTest: function(context) {
		var response = context.getComponent('response');

		response.data = 'test1test';
		response.send();
	},

	actionTest2: function(context) {
		var response = context.getComponent('response');

		response.data = 'test2test';
		response.send();
	}

});

module.exports = new self().exports();
