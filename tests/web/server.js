/**
 * @namespace Jii
 * @ignore
 */
global.Jii = require('jii');

require('jii-httpServer');
require('jii-comet');
require('jii-ar-sql');

global.app = Jii.namespace('app');

require('./models/DemoRow');

var custom = {};
require('jii-workers')
    .application('comet', {
        application: {
            basePath: __dirname,
            inlineActions: {
                'site/index': function (context) {
                    var clientConfig = {
                        application: {
                            components: {
                                db: {
                                    schema: {
                                        tables: Jii.app.db.getModelSchemaJson([
                                            'ep_comet_sample_demo_rows'
                                        ])
                                    }
                                }
                            }
                        }
                    };

                    return require('fs').readFileSync(__dirname + '/index.html')
                        .toString().replace(
                            '</head>',
                            '\t<script>JII_CONFIG = ' + Jii._s.trim(JSON.stringify(clientConfig), '"') + ';</script>\n$&'
                        );
                },
                'demo/add': function (context) {
                    var model = new app.models.DemoRow();
                    model.setAttributes(context.request.get());
                    model.save();
                },
                'demo/remove': function (context) {
                    app.models.DemoRow.findOne(context.request.get('id')).then(function (model) {
                        model.delete();
                    })
                }
            },
            components: {
                db: {
                    className: 'Jii.sql.mysql.Connection',
                    database: 'chiliproject',
                    username: 'root',
                    password: '123'
                },
                comet: {
                    className: 'Jii.comet.server.Server',
                    port: 3100,
                    host: '127.0.0.1',
                    transport: {
                        className: 'Jii.comet.server.transport.SockJs', // @todo automerge objects in config
                        urlPrefix: '/stat/node-comet/[0-9]+'
                    }
                },
                neat: {
                    className: 'Jii.comet.server.NeatServer',
                    bindings: require('./bindings.json').profiles
                },
                urlManager: {
                    className: 'Jii.urlManager.UrlManager'
                },
                http: {
                    className: 'Jii.httpServer.HttpServer',
                    port: 3000,
                    staticDirs: __dirname + '/public'
                }
            }
        }
    });

