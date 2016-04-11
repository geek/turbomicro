'use strict';

const Hoek = require('hoek');
const Joi = require('joi');
const Wreck = require('wreck');

const internals = {
  url: 'https://travis-ci.org/'
};

exports.getRepos = function (message, cb) {
  Wreck.get(url + message.user, (err, res, payload) => {
    if (err) {
      return cb(err);
    }

    const result = internals.extractRepos(payload);
    cb(null, result);
  });
};

exports.getRepos.config = {
  cache: { expiresIn: 60000 },
  schema: {
    user: Joi.string().required()
  }
};

exports.getRepos = function (message, cb) {
  Wreck.get(url + message.user, (err, res, payload) => {
    if (err) {
      return cb(err);
    }

    const result = internals.extractRepos(payload);
    cb(null, result);
  });
};

exports.getRepos.config = {
  cache: { expiresIn: 60000 },
  schema: {
    user: Joi.string().required()
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
