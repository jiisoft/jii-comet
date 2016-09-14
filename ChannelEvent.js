/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var Event = require('jii/base/Event');

/**
 * @class Jii.comet.ChannelEvent
 * @extends Jii.base.Event
 */
module.exports = Jii.defineClass('Jii.comet.ChannelEvent', /** @lends Jii.comet.ChannelEvent.prototype */{

	__extends: Event,

	/**
	 * @type {string}
	 */
	channel: null,

	/**
	 * @type {string}
	 */
	message: null

});
