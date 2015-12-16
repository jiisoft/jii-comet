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
 * @class Jii.comet.server.Request
 * @extends Jii.base.HttpRequest
 */
Jii.defineClass('Jii.comet.server.Request', /** @lends Jii.comet.server.Request.prototype */{

	__extends: Jii.base.HttpRequest,

    /**
     * @type {string}
     */
    uid: null,

	/**
	 * @type {object}
	 */
	headers: null,

	/**
	 * @type {string}
	 */
	ip: null,

	/**
	 * @type {number}
	 */
	port: null,

	toJson: function() {
		return Jii._.pick(this, [
			'headers',
			'ip',
            'port',
            '_queryParams'
		]);
	}

});
