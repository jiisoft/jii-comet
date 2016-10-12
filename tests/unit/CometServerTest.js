'use strict';

var Jii = require('../../index');
var Server = require('../../server/Server');
var HubServer = require('../../server/HubServer');
var TransportInterface = require('../../server/transport/TransportInterface');
var String = require('jii/helpers/String');
var ConnectionEvent = require('../../server/ConnectionEvent');
var MessageEvent = require('../../server/MessageEvent');
var Connection = require('../../server/Connection');
var Request = require('../../server/Request');
var HubInterface = require('../../server/hub/HubInterface');
var UnitTest = require('jii/base/UnitTest');

require('./bootstrap');

/**
 * @class tests.unit.CometServerTest
 * @extends Jii.base.UnitTest
 */
var CometServerTest = Jii.defineClass('tests.unit.CometServerTest', /** @lends tests.unit.CometServerTest.prototype */{

	__extends: UnitTest,

	__static: {
		SERVER_PORT: 8080
	},

	init: function() {
		Jii.app.setComponents({
			comet: {
				className: Server,
				port: this.__static.SERVER_PORT,
				transport: {
					className: require('../../server/transport/Sockjs')
				},
				hub: {
					className: require('../../server/hub/Blank')
				},
				queue: {
					className: require('../../server/queue/Blank')
				},
			},
			cometListener: {
				className: HubServer
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

	subscribeT2est: function (test) {
		/** @typedef {Jii.comet.ChannelEvent} event */
		var event = null;
		Jii.app.comet.on(Server.EVENT_CHANNEL, function(e) {
			event = e;
		});

		/** @typedef {Jii.comet.ChannelEvent} event */
		var event2 = null;
		Jii.app.comet.on(Server.EVENT_CHANNEL_NAME + 'test', function(e) {
			event2 = e;
		});

		/** @typedef {Jii.comet.ChannelEvent} event */
		var event3 = null;
		Jii.app.comet.on(Server.EVENT_CHANNEL_NAME + 'blabla', function(e) {
			event3 = e;
		});

		/** @typedef {Jii.comet.ChannelEvent} event */
		var hubEvent = null;
		Jii.app.comet.hub.on(HubInterface.EVENT_MESSAGE, function(e) {
			hubEvent = e;
		});

		setTimeout(function() {
			Jii.app.comet.sendToChannel('test', {foo: 588});

			test.strictEqual(true, Jii.app.comet.hasEventHandlers(Server.EVENT_CHANNEL));
			test.strictEqual(true, Jii.app.comet.hasEventHandlers(Server.EVENT_CHANNEL_NAME + 'test'));
			test.strictEqual(true, Jii.app.comet.hasEventHandlers(Server.EVENT_CHANNEL_NAME + 'blabla'));
			test.strictEqual(false, Jii.app.comet.hasEventHandlers(Server.EVENT_CHANNEL_NAME + 'qweqwe'));

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
				Jii.app.comet.off(Server.EVENT_CHANNEL);
				Jii.app.comet.off(Server.EVENT_CHANNEL_NAME + 'test');

				test.strictEqual(false, Jii.app.comet.hasEventHandlers(Server.EVENT_CHANNEL));
				test.strictEqual(false, Jii.app.comet.hasEventHandlers(Server.EVENT_CHANNEL_NAME + 'test'));
				test.strictEqual(true, Jii.app.comet.hasEventHandlers(Server.EVENT_CHANNEL_NAME + 'blabla'));

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

	pushActionToSelfT2est: function(test) {
		Jii.app.comet.hub.subscribe(HubServer.CHANNEL_NAME_ACTION);
		Jii.app.cometListener.hub.unsubscribe(HubServer.CHANNEL_NAME_ACTION);

		var incomeMessage = null;
		var connection = this._createConnection(function(m) { incomeMessage = m });

		// Subscribe
		var event = null;
		Jii.app.comet.on(HubServer.EVENT_MESSAGE, function(e) {
			event = e;
		});

		// Client connect
		Jii.app.comet.transport.trigger(TransportInterface.EVENT_ADD_CONNECTION, new ConnectionEvent({
			connection: connection
		}));

		// Client send command for run action
		Jii.app.comet.transport.trigger(TransportInterface.EVENT_MESSAGE, new MessageEvent({
			connection: connection,
			message: 'action site/test'
		}));

		setTimeout(function() {
			test.notStrictEqual(event, null);

			test.strictEqual(event.channel, HubServer.CHANNEL_NAME_ACTION);
			test.strictEqual(event.message, 'site/test');
			test.strictEqual(incomeMessage, 'action "test1test"');

			test.done();
		}, 50);
	},

	pushActionViaHubTest: function(test) {
		var incomeMessage = null;
		var connection = this._createConnection(function(m) { incomeMessage = m });

		// Client connect
		Jii.app.comet.transport.trigger(TransportInterface.EVENT_ADD_CONNECTION, new ConnectionEvent({
			connection: connection
		}));

		// Client send command for run action
		Jii.app.comet.transport.trigger(TransportInterface.EVENT_MESSAGE, new MessageEvent({
			connection: connection,
			message: 'action site/test2'
		}));

		setTimeout(function() {
			test.strictEqual(incomeMessage, 'action "test2test"');

			test.done();
		}, 50);
	},

	_createConnection: function(handler) {
		return new Connection({
			id: String.generateUid(),
			originalConnection: { write: handler, destroy: function() {} },
			request: new Request({
				headers: {},
				ip: '127.0.0.1',
				port: Jii.app.comet.port
			})
		});
	}

});

module.exports = new CometServerTest().exports();
