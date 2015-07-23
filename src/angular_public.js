function publishExternalAPI() {
  'use strict';
  
  setupModuleLoader(window);

  var ngModule = angular.module('ng', []);
  ngModule.provider('$parse', $ParseProvider);
  ngModule.provider('$rootScope', $RootScopeProvider);
}
