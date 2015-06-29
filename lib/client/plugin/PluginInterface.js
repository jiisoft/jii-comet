
'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.comet.client.plugin.PluginInterface
 * @extends Jii.base.Object
 */
Jii.defineClass('Jii.comet.client.plugin.PluginInterface', /** @lends Jii.comet.client.plugin.PluginInterface.prototype */{

	__extends: Jii.base.Object,

	/**
	 * @type {Jii.comet.client.Client}
	 */
	comet: null

});