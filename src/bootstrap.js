'use strict';

var $ = require('jquery');
var publishExternalAPI = require('./angular_public');
var createInjector = require('./injector');

publishExternalAPI();

window.angular.bootstrap = function(element, modules, config) {
  var $element = $(element);
  modules = modules || [];
  config = config || {};
  modules.unshift(['$provide', function($provide) {
    $provide.value('$rootElement', $element);
  }]);
  modules.unshift('ng');
  var injector = createInjector(modules, config.strictDi);
  $element.data('$injector', injector);
  injector.invoke(['$compile', '$rootScope', function($compile, $rootScope) {
    $rootScope.$apply(function() {
      $compile($element)($rootScope);
    });
  }]);
  return injector;
};
