module.exports = {
    application: {
        basePath: __dirname + '/..',
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
                    className: 'Jii.comet.server.transport.SockJs',
                    urlPrefix: '/stat/node-comet/[0-9]+'
                }
            },
            neat: {
                className: 'Jii.comet.server.NeatServer',
                bindings: {
                    test: {
                        all: {
                            serverModel: 'app.models.DemoRow',
                            'client': {
                                abc: 123
                            }
                        }
                    }
                }
            },
            urlManager: {
                className: 'Jii.urlManager.UrlManager'
            },
            http: {
                className: 'Jii.httpServer.HttpServer',
                port: 3000,
                staticDirs: __dirname + '/../../web'
            },
            view: {
                className: 'Jii.view.ServerWebView'
            }
        }
    }
};