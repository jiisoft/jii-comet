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
                serverUrl: 'http://127.0.0.1:3100/stat/node-comet/0/'
            },
            neat: {
                className: 'Jii.comet.client.NeatClient'
            }
        }
    }
}).start();


NeatComet.NeatCometClient.prototype.profilesDefinition = {
    "test": {
        "all": {
            "abc": 123
        },
        "channelFiltered": null,
        "jsFiltered": null,
        "bothFiltered": null
    },
    "linkTest": {
        "master": null,
        "detail": null
    }
};

Jii.app.neat.openProfile('test', {
    category: 'n',
    filter: 'nn'
});