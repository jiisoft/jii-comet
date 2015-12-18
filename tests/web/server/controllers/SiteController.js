/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

var Jii = require('jii');

/**
 * @class app.controllers.SiteController
 * @extends Jii.base.Controller
 */
Jii.defineClass('app.controllers.SiteController', /** @lends app.controllers.SiteController.prototype */{

	__extends: Jii.base.Controller,

	/**
	 *
	 * @param {Jii.base.Context} context
	 * @param {Jii.httpServer.Request} context.request
	 * @param {Jii.httpServer.Response} context.response
	 */
	actionIndex: function(context) {
        var clientConfig = {
            application: {
                components: {
                    db: {
                        schema: {
                            tables: Jii.app.db.getModelSchemaJson([
                                'ep_comet_sample_demo_rows'
                            ])
                        }
                    },
                    neat: {
                        bindings: Jii.app.neat.bindings // @todo use getClientBindings()
                    }
                }
            }
        };

        Jii.app.view.registerJs('JII_CONFIG = ' + Jii._s.trim(JSON.stringify(clientConfig), '"') + ';', Jii.view.WebView.POS_HEAD);

        return this.render('index', {
            clientConfig: clientConfig
        });
	}

});