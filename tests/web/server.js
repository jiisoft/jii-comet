global.Jii = require('jii');
require('jii-comet');

var custom = {};//require('./config');
require('jii-workers')
    .application('comet', Jii.mergeConfigs(
        {
            application: {
                basePath: __dirname,
                components: {
                    comet: {
                        className: 'Jii.comet.server.Server'
                    },
                    neat: {
                        className: 'Jii.comet.server.NeatServer',
                        configFileName: __dirname + '/bindings.json',
                        dataLoadHandler: function(params) {
                            // send to php
                            return Promise.resolve({});

                            /*return Jii.app.getModule('proxy').request(
                                Jii.app.params.phpServerLoadDataAction,
                                { msg: JSON.stringify(requestParams) }
                            );*/
                        }
                    }
                }
            }
        },
        custom.comet || {}
    ))
    .application('http', Jii.mergeConfigs(
        {
            application: {
                basePath: __dirname,
                components: {
                    comet: {
                        className: 'Jii.comet.server.HubServer',
                        listenActions: false
                    },
                    http: {
                        className: 'Jii.httpServer.HttpServer',
                        port: 3000
                    }
                }
            }
        },
        custom.http || {}
    ));

