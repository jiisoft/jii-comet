/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

var Jii = require('jii');

/**
 * @class app.controllers.ApiController
 * @extends Jii.base.Controller
 */
Jii.defineClass('app.controllers.ApiController', /** @lends app.controllers.ApiController.prototype */{

	__extends: Jii.base.Controller,

    actions: function () {
        return {
            ar: 'Jii.sql.remote.ActiveRecordAction'
        };
    }

});