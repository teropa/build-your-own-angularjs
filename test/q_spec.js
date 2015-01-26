/* jshint globalstrict: true */
/* global publishExternalAPI: false, createInjector: false */
'use strict';

describe("$q", function() {

  var $q, $rootScope;

  beforeEach(function() {
    publishExternalAPI();
    var injector = createInjector(['ng']);
    $q = injector.get('$q');
    $rootScope = injector.get('$rootScope');
  });

  it('can create a deferred', function() {
    var d = $q.defer();
    expect(d).toBeDefined();
  });

  it('has a promise for each Deferred', function() {
    var d = $q.defer();
    expect(d.promise).toBeDefined();
  });

  it('can resolve a promise', function(done) {
    var deferred = $q.defer();
    var promise  = deferred.promise;

    var promiseSpy = jasmine.createSpy();
    promise.then(promiseSpy);

    deferred.resolve('a-ok');

    setTimeout(function() {
      expect(promiseSpy).toHaveBeenCalledWith('a-ok');
      done();
    }, 1);
  });

  it('works when resolved before promise listener', function(done) {
    var d = $q.defer();
    d.resolve(42);

    var promiseSpy = jasmine.createSpy();
    d.promise.then(promiseSpy);

    setTimeout(function() {
      expect(promiseSpy).toHaveBeenCalledWith(42);
      done();
    }, 0);
  });

  it('does not resolve promise immediately', function() {
    var d = $q.defer();

    var promiseSpy = jasmine.createSpy();
    d.promise.then(promiseSpy);

    d.resolve(42);

    expect(promiseSpy).not.toHaveBeenCalled();
  });

  it('resolves promise at next digest', function() {
    var d = $q.defer();

    var promiseSpy = jasmine.createSpy();
    d.promise.then(promiseSpy);

    d.resolve(42);
    $rootScope.$apply();

    expect(promiseSpy).toHaveBeenCalledWith(42);
  });

});
