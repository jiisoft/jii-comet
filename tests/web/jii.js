/**
 * @namespace Jii
 * @ignore
 */
global.Jii = require('jii');
require('jii-httpServer');
require('jii-comet');
require('jii-ar-sql');
require('jii-view');

global.app = Jii.namespace('app');
require('./models/DemoRow');
require('./server/controllers/ApiController');
require('./server/controllers/SiteController');

require('jii-workers')
    .application('comet', require('./server/config/main'));
