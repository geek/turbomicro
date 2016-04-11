'use strict';

const Hapi = require('hapi');
const Hoek = require('hoek');
const Joi = require('joi');
const TurboMicro = require('../../');
const Wreck = require('wreck');

const internals = {
  url: 'https://registry.npmjs.org/'
};

const server = new Hapi.Server();
server.connection({ listener: TurboMicro.createListener(), port: 0 });
server.register(TurboMicro, function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  server.actor(internals.query);

  server.start(function () {
    if (process.send) {
      process.send(server.info);
    }
  });
});


internals.query = {
  id: 'query-npm',
  cache: { expiresIn: 60000 },
  validate: {
    payload: {
      name: Joi.string().required()
    }
  },
  handler: function (request, reply) {
    Wreck.get(url + request.payload.name, (err, res, payload) => {
      if (err) {
        return reply(err);
      }

      const result = internals.extract(payload);
      reply(null, result);
    });
  }
};

internals.extract = function (npmResult) {
  const mapping = {
    'name', 'name',
    'url': 'url',
    'id': '_id',
    'description': 'description',
    'latestVersion': 'latest',
    'releaseCount': 'data.versions.length',
    'author': 'author',
    'licence': 'license',
    'maintainers': 'maintainers',
    'readme': 'readme',
    'homepage': 'homepage'
  };

  return Hoek.transform(npmResult, mapping, { default: '', functions: true });
};
