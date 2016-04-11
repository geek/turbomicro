'use strict';

const Hapi = require('hapi');
const Hoek = require('hoek');
const Joi = require('joi');
const TurboMicro = require('../../');
const Wreck = require('wreck');

const internals = {
  url: 'https://registry.npmjs.org/'
};

const turboMicro = TurboMicro();
const server = new Hapi.Server();
server.connection({ listener: turboMicro.listener, port: 5000, labels: ['turbo'] });
server.register({ register: turboMicro.register, config: { label: 'turbo' }}, function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  server.start(function () {
    if (process.send) {
      process.send(server.info);
    }
    server.actor(internals.query);

    console.log(`Listening on port: ${server.info.port}`);
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
    Wreck.get(internals.url + request.payload.name, (err, res, payload) => {
      if (err) {
        return reply(err);
      }

      try {
        const obj = JSON.parse(payload.toString())
        const result = internals.extract(obj);
        reply(null, result);
      }
      catch (e) {
        if (e) {
          return reply(e);
        }
      }
    });
  }
};

internals.extract = function (obj) {
  const mapping = {
    'name': 'name',
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

  return Hoek.transform(obj, mapping, { default: '', functions: true });
};
