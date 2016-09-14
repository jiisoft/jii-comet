/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var Event = require('jii/base/Event');

/**
 * @class Jii.comet.server.ConnectionEvent
 * @extends Jii.base.Event
 */
module.exports = Jii.defineClass('Jii.comet.server.ConnectionEvent', /** @lends Jii.comet.server.ConnectionEvent.prototype */{

	__extends: Event,

	/**
	 * @type {Jii.comet.server.Connection}
	 */
	connection: null

});
