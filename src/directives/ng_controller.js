'use strict';

var ngControllerDirective = function() {
  return {
    restrict: 'A',
    scope: true,
    controller: '@'
  };
};

module.exports = ngControllerDirective;
