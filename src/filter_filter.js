'use strict';

var _ = require('lodash');

function filterFilter() {
  return function(array, filterExpr) {
    return _.filter(array, filterExpr);
  };
}

module.exports = filterFilter;
