/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('./ConnectionEvent');

/**
 * @class Jii.comet.server.MessageEvent
 * @extends Jii.comet.server.ConnectionEvent
 */
Jii.defineClass('Jii.comet.server.MessageEvent', /** @lends Jii.comet.server.MessageEvent.prototype */{

	__extends: Jii.comet.server.ConnectionEvent,

	/**
	 * @type {object}
	 */
	message: null

});
