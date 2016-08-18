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

	__extends: 'Jii.base.HttpRequest',

    /**
     * @type {string}
     */
    uid: null,

	/**
	 * @type {string}
	 */
	ip: null,

	toJSON() {
        return {
            ip: this.ip,
            port: this.getPort(),
            params: this.getQueryParams(),
            headers: this.getHeaders().toJSON()
        };
	}

});
