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
 * @class Jii.comet.ChannelEvent
 * @extends Jii.base.Event
 */
Jii.defineClass('Jii.comet.ChannelEvent', /** @lends Jii.comet.ChannelEvent.prototype */{

	__extends: Jii.base.Event,

	/**
	 * @type {string}
	 */
	channel: null,

	/**
	 * @type {string}
	 */
	message: null

});
