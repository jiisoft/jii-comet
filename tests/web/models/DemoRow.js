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
 * @class app.models.DemoRow
 * @extends Jii.sql.ActiveRecord
 */
Jii.defineClass('app.models.DemoRow', /** @lends app.models.DemoRow.prototype */{

	__extends: Jii.sql.ActiveRecord,

	__static: /** @lends Jii.comet.server.HubServer */{

        tableName: function () {
            return 'ep_comet_sample_demo_rows';
        }

	},

    rules: function() {
        return [
            [['subject'], 'string', {max: 255}],
            [['category', 'kind'], 'string', {max: 1}]
        ];
    }

});
