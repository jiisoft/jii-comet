
'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('./TransportInterface');

//var socketIo = require('socket.io');

/**
 * @class Jii.comet.client.transport.SocketIo
 * @extends Jii.comet.client.transport.TransportInterface
 */
Jii.defineClass('Jii.comet.client.transport.SocketIo', /** @lends Jii.comet.client.transport.SocketIo.prototype */{

	__extends: Jii.comet.client.transport.TransportInterface

});