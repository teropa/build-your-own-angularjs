/* jshint globalstrict: true */
/* global createInjector: false, setupModuleLoader: false, angular: false */
'use strict';

describe('injector', function() {

  beforeEach(function() {
    delete window.angular;
    setupModuleLoader(window);
  });

  it('can be created', function() {
    var injector = createInjector([]);
    expect(injector).toBeDefined();
  });

  it('has a constant that has been registered to a module', function() {
    var module = angular.module('myModule', []);
    module.constant('aConstant', 42);
    var injector = createInjector(['myModule']);
    expect(injector.has('aConstant')).toBe(true);
  });

  it('does not have a non-registered constant', function() {
    var module = angular.module('myModule', []);
    var injector = createInjector(['myModule']);
    expect(injector.has('aConstant')).toBe(false);
  });

  it('does not allow a constant called hasOwnProperty', function() {
    var module = angular.module('myModule', []);
    module.constant('hasOwnProperty', _.constant(false));
    expect(function() {
      createInjector(['myModule']);
    }).toThrow();
  });

  it('can return a registered constant', function() {
    var module = angular.module('myModule', []);
    module.constant('aConstant', 42);
    var injector = createInjector(['myModule']);
    expect(injector.get('aConstant')).toBe(42);
  });

});
