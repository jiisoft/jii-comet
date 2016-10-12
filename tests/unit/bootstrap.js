'use strict';

var Jii = require('jii');
var Controller = require('jii/base/Controller');

var SiteController = Jii.defineClass('app.controllers.SiteController', {

	__extends: Controller,

	actionTest: function(context) {
		var response = context.getComponent('response');

		response.data = 'test1test';
		response.send();
	},

	actionTest2: function(context) {
		var response = context.getComponent('response');

		response.data = 'test2test';
		response.send();
	}

});

Jii.createWebApplication({
	application: {
		basePath: __dirname,
		controllerMap: {
			SiteController: SiteController
		}
	}
});

// AR: display errors in callbacks defined within the tests
process.on('uncaughtException', function (e) {
	console.log("Uncaught exception:\n" + e.stack);
});