'use strict';

var _ = require('lodash');

var filters = {};

function register(name, factory) {
  if (_.isObject(name)) {
    return _.map(name, function(factory, name) {
      return register(name, factory);
    });
  } else {
    var filter = factory();
    filters[name] = filter;
    return filter;
  }
}

function filter(name) {
  return filters[name];
}

module.exports = {register: register, filter: filter};
