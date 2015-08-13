global.Jii = require('jii');
require('jii-comet');

Jii.createWebApplication({
	application: {
		basePath: __dirname,
		components: {
			comet: {
				className: 'Jii.comet.server.Server'
			}
		}
	}
});

Jii.app.comet.start();
Jii.app.comet.on(Jii.comet.server.transport.TransportInterface.EVENT_ADD_CONNECTION, function(event) {
	Jii.app.comet.subscribe(event.connectionId, 'test');
});