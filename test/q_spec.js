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

  it('may only be resolved once', function() {
    var d = $q.defer();

    var promiseSpy = jasmine.createSpy();
    d.promise.then(promiseSpy);

    d.resolve(42);
    d.resolve(43);

    $rootScope.$apply();

    expect(promiseSpy.calls.count()).toEqual(1);
    expect(promiseSpy).toHaveBeenCalledWith(42);
  });

  it('may only ever be resolved once', function() {
    var d = $q.defer();

    var promiseSpy = jasmine.createSpy();
    d.promise.then(promiseSpy);

    d.resolve(42);
    $rootScope.$apply();
    expect(promiseSpy).toHaveBeenCalledWith(42);

    d.resolve(43);
    $rootScope.$apply();
    expect(promiseSpy.calls.count()).toEqual(1);
  });

  it('resolves a listener added after resolution', function() {
    var d = $q.defer();
    d.resolve(42);
    $rootScope.$apply();

    var promiseSpy = jasmine.createSpy();
    d.promise.then(promiseSpy);
    $rootScope.$apply();

    expect(promiseSpy).toHaveBeenCalledWith(42);
  });

  it('may have multiple listeners', function() {
    var d = $q.defer();

    var firstSpy = jasmine.createSpy();
    var secondSpy = jasmine.createSpy();
    d.promise.then(firstSpy);
    d.promise.then(secondSpy);

    d.resolve(42);
    $rootScope.$apply();

    expect(firstSpy).toHaveBeenCalledWith(42);
    expect(secondSpy).toHaveBeenCalledWith(42);
  });

  it('invokes callbacks as they are registered', function() {
    var d = $q.defer();

    var firstSpy = jasmine.createSpy();
    var secondSpy = jasmine.createSpy();

    d.promise.then(firstSpy);
    d.resolve(42);
    $rootScope.$apply();
    expect(firstSpy.calls.count()).toBe(1);
    expect(secondSpy.calls.count()).toBe(0);

    d.promise.then(secondSpy);
    expect(firstSpy.calls.count()).toBe(1);
    expect(secondSpy.calls.count()).toBe(0);

    $rootScope.$apply();
    expect(firstSpy.calls.count()).toBe(1);
    expect(secondSpy.calls.count()).toBe(1);
  });

  it('can reject a deferred', function() {
    var d = $q.defer();

    var fulfillSpy = jasmine.createSpy();
    var rejectSpy  = jasmine.createSpy();
    d.promise.then(fulfillSpy, rejectSpy);

    d.reject('fail');
    $rootScope.$apply();

    expect(fulfillSpy).not.toHaveBeenCalled();
    expect(rejectSpy).toHaveBeenCalledWith('fail');
  });

  it('can reject a promise just once', function() {
    var d = $q.defer();

    var rejectSpy  = jasmine.createSpy();
    d.promise.then(null, rejectSpy);

    d.reject('fail');
    $rootScope.$apply();
    expect(rejectSpy.calls.count()).toBe(1);

    d.reject('fail again');
    $rootScope.$apply();
    expect(rejectSpy.calls.count()).toBe(1);
  });

  it('cannot fulfill a promise once rejected', function() {
    var d = $q.defer();

    var fulfillSpy = jasmine.createSpy();
    var rejectSpy  = jasmine.createSpy();
    d.promise.then(fulfillSpy, rejectSpy);

    d.reject('fail');
    $rootScope.$apply();

    d.resolve('success');
    $rootScope.$apply();

    expect(fulfillSpy).not.toHaveBeenCalled();
  });

  it('does not require a failure handler each time', function() {
    var d = $q.defer();

    var fulfillSpy = jasmine.createSpy();
    var rejectSpy  = jasmine.createSpy();
    d.promise.then(fulfillSpy);
    d.promise.then(null, rejectSpy);

    d.reject('fail');
    $rootScope.$apply();

    expect(rejectSpy).toHaveBeenCalledWith('fail');
  });

  it('does not require a success handler each time', function() {
    var d = $q.defer();

    var fulfillSpy = jasmine.createSpy();
    var rejectSpy  = jasmine.createSpy();
    d.promise.then(fulfillSpy);
    d.promise.then(null, rejectSpy);

    d.resolve('ok');
    $rootScope.$apply();

    expect(fulfillSpy).toHaveBeenCalledWith('ok');
  });

  it('can register rejection handler with catch', function() {
    var d = $q.defer();

    var rejectSpy  = jasmine.createSpy();
    d.promise.catch(rejectSpy);
    d.reject('fail');
    $rootScope.$apply();

    expect(rejectSpy).toHaveBeenCalled();
  });

  it('invokes a finally handler when fulfilled', function() {
    var d = $q.defer();

    var finallySpy  = jasmine.createSpy();
    d.promise.finally(finallySpy);
    d.resolve(42);
    $rootScope.$apply();

    expect(finallySpy).toHaveBeenCalledWith();
  });

  it('invokes a finally handler when rejected', function() {
    var d = $q.defer();

    var finallySpy  = jasmine.createSpy();
    d.promise.finally(finallySpy);
    d.reject('fail');
    $rootScope.$apply();

    expect(finallySpy).toHaveBeenCalledWith();
  });

  it('allows chaining handlers', function() {
    var d = $q.defer();

    var fulfilledSpy = jasmine.createSpy();
    d.promise.then(function(result) {
      return result + 1;
    }).then(function(result) {
      return result * 2;
    }).then(fulfilledSpy);

    d.resolve(20);
    $rootScope.$apply();

    expect(fulfilledSpy).toHaveBeenCalledWith(42);
  });

  it('does not modify original resolution in chains', function() {
    var d = $q.defer();

    var fulfilledSpy = jasmine.createSpy();

    d.promise.then(function(result) {
      return result + 1;
    }).then(function(result) {
      return result * 2;
    });
    d.promise.then(fulfilledSpy);

    d.resolve(20);
    $rootScope.$apply();

    expect(fulfilledSpy).toHaveBeenCalledWith(20);
  });

  it('catches rejection on chained handler', function() {
    var d = $q.defer();

    var rejectedSpy = jasmine.createSpy();
    d.promise.then(_.noop).catch(rejectedSpy);

    d.reject('fail');
    $rootScope.$apply();

    expect(rejectedSpy).toHaveBeenCalledWith('fail');
  });

  it('fulfills on chained handler', function() {
    var d = $q.defer();

    var fulfilledSpy = jasmine.createSpy();
    d.promise.catch(_.noop).then(fulfilledSpy);

    d.resolve(42);
    $rootScope.$apply();

    expect(fulfilledSpy).toHaveBeenCalledWith(42);
  });

  it('treats catch return value as resolution', function() {
    var d = $q.defer();

    var fulfilledSpy = jasmine.createSpy();
    d.promise
      .catch(function() {
        return 42;
      })
      .then(fulfilledSpy);

    d.reject('fail');
    $rootScope.$apply();

    expect(fulfilledSpy).toHaveBeenCalledWith(42);
  });

  it('rejects chained promise when handler throws', function() {
    var d = $q.defer();

    var rejectedSpy = jasmine.createSpy();
    d.promise.then(function() {
      throw 'fail';
    }).catch(rejectedSpy);
    d.resolve(42);

    $rootScope.$apply();

    expect(rejectedSpy).toHaveBeenCalledWith('fail');
  });

  it('does not reject current promise when handler throws', function() {
    var d = $q.defer();

    var rejectedSpy = jasmine.createSpy();
    d.promise.then(function() {
      throw 'fail';
    });
    d.promise.catch(rejectedSpy);
    d.resolve(42);

    $rootScope.$apply();

    expect(rejectedSpy).not.toHaveBeenCalled();
  });

});
