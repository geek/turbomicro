'use strict';

const Net = require('net');
const From = require('from2');
const Pump = require('pump');
const Tentacoli = require('tentacoli');
const Through = require('through2');


const client = Net.connect(process.env.CONNECT_PORT || 5000);
var tentacoli = Tentacoli();
Pump(client, tentacoli, client);

tentacoli.request({
  act: 'query-npm',
  payload: {
    name: 'tentacoli'
  }
}, function (err, result) {
  if (err) {
    throw err
  }

  console.log('--> result is', result)
  tentacoli.destroy();
});
