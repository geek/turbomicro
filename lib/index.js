'use strict';

const Hoek = require('hoek');
const Listener = require('./Listener');
const Package = require('../package.json');

const internals = {};

module.exports = function () {
  const listener = internals.createListener();

  let register = function (server, options, next) {
    const label = options.label || 'turbo';

    server.decorate('server', 'actor', internals.actor);
    listener.on('act', (req, reply) => {
      const connection = server.select(label)[0] || server;
      const route = connection.lookup(req.act);
      if (!route) {
        return reply(Boom.notFound());
      }

      route.settings.handler.call(server, req, reply);
    });
    next();
  };

  register.attributes = {
    pkg: Package
  };

  return { listener, register };
};


internals.createListener = function (options) {
  return new Listener(options);
};


internals.actor = function (config) {
  Hoek.assert(config, 'config must exist');
  Hoek.assert(config.id, 'id is a required property on config');
  Hoek.assert(typeof config.handler === 'function', 'handler must be a function property on config');

  this.route({
    method: 'act',
    path: '/' + config.id,
    config: config
  });
};
