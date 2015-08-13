var Jii = require('jii');
require('jii-assets');

Jii.createWebApplication({
	application: {
		basePath: __dirname,
		components: {
			assetManager: {
				className: 'Jii.assets.AssetManager',
				bundles: {
					jii: {
						className: 'Jii.assets.AssetBundle',
						commonJs: true,
						basePath: __dirname,
						js: [
							'client.js'
						]
					}
				},
				basePath: __dirname + '/assets',
				baseUrl: '/assets'
			}
		}
	}
});

var gulp = require('gulp');
var tasks = Jii.assets.GulpTasks.applyTo(gulp);

gulp.task('default', tasks);
