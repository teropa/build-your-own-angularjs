'use strict';

var $ = require('jquery');
var publishExternalAPI = require('../../src/angular_public');
var createInjector = require('../../src/injector');

describe('ngClick', function() {

  var $compile, $rootScope;

  beforeEach(function() {
    delete window.angular;
    publishExternalAPI();
    var injector = createInjector(['ng']);
    $compile = injector.get('$compile');
    $rootScope = injector.get('$rootScope');
  });

  it('starts a digest on click', function() {
    var watchSpy = jasmine.createSpy();
    $rootScope.$watch(watchSpy);

    var button = $('<button ng-click="42"></button>');
    $compile(button)($rootScope);

    button.click();
    expect(watchSpy).toHaveBeenCalled();
  });

  it('evaluates given expression on click', function() {
    $rootScope.doSomething = jasmine.createSpy();
    var button = $('<button ng-click="doSomething()"></button>');
    $compile(button)($rootScope);

    button.click();
    expect($rootScope.doSomething).toHaveBeenCalled();
  });

  it('passes $event to expression', function() {
    $rootScope.doSomething = jasmine.createSpy();
    var button = $('<button ng-click="doSomething($event)"></button>');
    $compile(button)($rootScope);

    button.click();
    var evt = $rootScope.doSomething.calls.mostRecent().args[0];
    expect(evt).toBeDefined();
    expect(evt.type).toBe('click');
    expect(evt.target).toBeDefined();
  });

});
