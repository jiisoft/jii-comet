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
 * @class Jii.comet.client.MessageEvent
 * @extends Jii.base.Event
 */
Jii.defineClass('Jii.comet.client.MessageEvent', /** @lends Jii.comet.client.MessageEvent.prototype */{

	__extends: 'Jii.base.Event',

	/**
	 * @type {string}
	 */
	message: null

});
