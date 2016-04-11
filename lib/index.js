'use strict';

const Package = require('../package.json');

const internals = {};

module.exports = function (server, options, next) {
  server.decorate('server', 'actor', internals.actor);

  next();
};

module.exports.attributes = {
  pkg: Package
};


module.exports.createListener = function () {

};
