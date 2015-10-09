
/**
 * @namespace Jii
 * @ignore
 */
global.Jii = require('jii');

require('jii-httpServer');
require('jii-comet');

var custom = {};//require('./config');
require('jii-workers')
    .application('comet', Jii.mergeConfigs(
        {
            application: {
                basePath: __dirname,
                inlineActions: {
                    // From php to comet
                    'stat/node': function(context) {
                        switch (context.request.post('method')) {
                            case 'publish':
                                var channel = context.request.post('channel');
                                var data = context.request.post('data');

                                if (channel && data) {
                                    Jii.app.comet.sendToChannel(channel, JSON.parse(data));
                                    return 'ok';
                                }

                                context.response.setStatusCode(400);
                                return 'Channel and data params is required.';

                            default:
                                context.response.setStatusCode(400);
                                return 'Wrong api method.';
                        }
                    }
                },
                components: {
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
                        configFileName: __dirname + '/../../../../../chiliproject.local/protected/app/config/cometBindingFiles.json',

                        // From comet to php
                        dataLoadHandler: function(params) {
                            // @todo Php server url
                            var url = 'http://chiliproject.local/stat/comet/api/load-data/';
                            var data = { msg: JSON.stringify(params) };

                            return new Promise(function(resolve) {
                                require('request')({
                                    method: 'POST',
                                    uri: url,
                                    form: data
                                }, function(error, response, body) {
                                    if (error || !response || response.statusCode >= 400) {
                                        throw new Jii.exceptions.ApplicationException('Request to server `' + url + '` failed: ' + error);
                                    }

                                    resolve(JSON.parse(body));
                                });
                            });
                        }
                    },
                    urlManager: {
                        className: 'Jii.urlManager.UrlManager'
                    },
                    http: {
                        className: 'Jii.httpServer.HttpServer',
                        port: 3000
                    }
                }
            }
        },
        custom.comet || {}
    ));

