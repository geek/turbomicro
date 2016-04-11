'use strict';

const Events = require('events');
const Net = require('net');
const Boom = require('boom');
const Hoek = require('hoek');
const Pump = require('pump');
const Tentacoli = require('tentacoli');

const internals = {};

exports = module.exports = internals.Listener = function () {
  Hoek.assert(this.constructor === internals.Listener, 'Must be constructed with new');

  Events.EventEmitter.call(this);

  this._server = Net.createServer();
  this._wireEvents();
};

Hoek.inherits(internals.Listener, Events.EventEmitter);


internals.Listener.prototype.close = function (callback) {
  this._server.close(() => {
    this._server.removeListener('connection', this._onConnection);
    callback();
  });
};


internals.Listener.prototype.listen = function () {
  this._server.listen.apply(this._server, arguments);
};


internals.Listener.prototype.address = function () {
  return this._server.address();
};


internals.Listener.prototype._wireEvents = function () {
  this._server.on('connection', (connection) => {
    this._onConnection(connection);
    this.emit('connection', connection);
  });

  this._server.once('listening', (err) => {
    this.emit('listening', err);
  });

  this._server.on('error', (err) => {
    this.emit('error', err);
  });

  this._server.on('clientError', (err) => {
    this.emit('clientError', err);
  });
};


internals.Listener.prototype._onConnection = function (connection) {
  const tentacoli = Tentacoli();
  Pump(tentacoli, connection, tentacoli);

  tentacoli.on('request', (req, reply) => {
    this._handleRequest(req, reply);
  });
};


internals.Listener.prototype._handleRequest = function (req, reply) {
  if (!req.act) {
    return reply(Boom.badRequest('act is required'));
  }

  this.emit('act', req, reply);
};
