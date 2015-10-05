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
 * @class Jii.comet.client.RequestEvent
 * @extends Jii.base.Event
 */
Jii.defineClass('Jii.comet.client.RequestEvent', /** @lends Jii.comet.client.RequestEvent.prototype */{

	__extends: Jii.base.Event,

	/**
	 * @type {string}
	 */
    route: null

});
