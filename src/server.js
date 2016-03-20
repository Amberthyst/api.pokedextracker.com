'use strict';

const Bluebird = require('bluebird');
const Hapi     = require('hapi');
const Util     = require('util');

const Config = require('../config');

Bluebird.longStackTraces();

const server = new Hapi.Server({
  connections: {
    router: {
      stripTrailingSlash: true
    },
    routes: {
      json: { space: 2 },
      cors: { credentials: true }
    }
  }
});

server.connection({ port: Config.PORT });

server.register([
  require('hapi-bookshelf-serializer'),
  require('./plugins/services/errors'),
  require('./plugins/services/auth'),
  require('./plugins/features/captures'),
  require('./plugins/features/pokemon'),
  require('./plugins/features/sessions'),
  require('./plugins/features/users')
], (err) => {
  /* istanbul ignore if */
  if (err) {
    throw err;
  }
})

/* istanbul ignore next */
process.on('SIGTERM', () => {
  Util.log(`Draining server for ${Config.DRAIN_TIMEOUT}ms...`);
  server.stop({ timeout: Config.DRAIN_TIMEOUT }, () => {
    Util.log('Server stopped');
    process.exit(0);
  });
});

module.exports = server;
