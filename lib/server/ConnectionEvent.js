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

/**
 * @class Jii.comet.server.ConnectionEvent
 * @extends Jii.base.Event
 */
Jii.defineClass('Jii.comet.server.ConnectionEvent', /** @lends Jii.comet.server.ConnectionEvent.prototype */{

	__extends: 'Jii.base.Event',

	/**
	 * @type {Jii.comet.server.Connection}
	 */
	connection: null

});
