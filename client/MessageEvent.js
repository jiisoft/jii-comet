/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var Event = require('jii/base/Event');

/**
 * @class Jii.comet.client.MessageEvent
 * @extends Jii.base.Event
 */
module.exports = Jii.defineClass('Jii.comet.client.MessageEvent', /** @lends Jii.comet.client.MessageEvent.prototype */{

	__extends: Event,

	/**
	 * @type {string}
	 */
	message: null

});
