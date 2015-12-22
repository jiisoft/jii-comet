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
 * @class Jii.comet.LogEvent
 * @extends Jii.base.Event
 */
Jii.defineClass('Jii.comet.LogEvent', /** @lends Jii.comet.LogEvent.prototype */{

	__extends: 'Jii.base.Event',

	/**
	 * Level: debug/info/warning/error
	 * @type {string}
	 */
	level: null,

	/**
	 * Log message
	 * @type {string}
	 */
	message: null

});
