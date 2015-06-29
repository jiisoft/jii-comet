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
 * @class Jii.comet.client.ChannelEvent
 * @extends Jii.base.Event
 */
Jii.defineClass('Jii.comet.client.ChannelEvent', /** @lends Jii.comet.client.ChannelEvent.prototype */{

	__extends: Jii.base.Event,

	/**
	 * @type {string}
	 */
	channel: null

});
