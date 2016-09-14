/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var ConnectionEvent = require('./ConnectionEvent');

/**
 * @class Jii.comet.server.MessageEvent
 * @extends Jii.comet.server.ConnectionEvent
 */
module.exports = Jii.defineClass('Jii.comet.server.MessageEvent', /** @lends Jii.comet.server.MessageEvent.prototype */{

	__extends: ConnectionEvent,

	/**
	 * @type {object}
	 */
	message: null

});
