require('jii/deps');
require('jii-comet/sockjs');
require('jii-comet/neat');

var app = Jii.namespace('app');

Jii.createWebApplication({
    application: {
        basePath: '/',
        components: {
            comet: {
                className: 'Jii.comet.client.Client',
                serverUrl: 'http://localhost:4100/comet'
            },
            neat: {
                className: 'Jii.comet.client.NeatClient'
            }
        }
    }
});

Jii.app.neat.open({
    main: {
    }
});