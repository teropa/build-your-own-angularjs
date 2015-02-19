/* jshint globalstrict: true */
'use strict';

function qFactory(callLater) {

  function processQueue(state) {
    var pending = state.pending;
    delete state.pending;
    _.forEach(pending, function(handlers) {
      var deferred = handlers[0];
      var fn = handlers[state.status];
      try {
        if (_.isFunction(fn)) {
          deferred.resolve(fn(state.value));
        } else if (state.status === 1) {
          deferred.resolve(state.value);
        } else {
          deferred.reject(state.value);
        }
      } catch (e) {
        deferred.reject(e);
      }
    });
  }

  function scheduleProcessQueue(state) {
    callLater(function() {
      processQueue(state);
    });
  }

  function makePromise(value, resolved) {
    var d = new Deferred();
    if (resolved) {
      d.resolve(value);
    } else {
      d.reject(value);
    }
    return d.promise;
  }

  function handleFinallyCallback(callback, value, resolved) {
    var callbackValue = callback();
    if (callbackValue && callbackValue.then) {
      return callbackValue.then(function() {
        return makePromise(value, resolved);
      });
    } else {
      return makePromise(value, resolved);
    }
  }

  function Promise() {
    this.$$state = {};
  }
  Promise.prototype.then = function(onFulfilled, onRejected, onProgress) {
    var result = new Deferred();
    this.$$state.pending = this.$$state.pending || [];
    this.$$state.pending.push([result, onFulfilled, onRejected, onProgress]);
    if (this.$$state.status > 0) {
      scheduleProcessQueue(this.$$state);
    }
    return result.promise;
  };
  Promise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
  };
  Promise.prototype.finally = function(callback, progressBack) {
    return this.then(function(value) {
      return handleFinallyCallback(callback, value, true);
    }, function(rejection) {
      return handleFinallyCallback(callback, rejection, false);
    }, progressBack);
  };

  function Deferred() {
    this.promise = new Promise();
  }
  Deferred.prototype.resolve = function(value) {
    if (this.promise.$$state.status) {
      return;
    }
    if (value && _.isFunction(value.then)) {
      value.then(
        _.bind(this.resolve, this),
        _.bind(this.reject, this),
        _.bind(this.notify, this)
      );
    } else {
      this.promise.$$state.value = value;
      this.promise.$$state.status = 1;
      scheduleProcessQueue(this.promise.$$state);
    }
  };
  Deferred.prototype.reject = function(reason) {
    if (this.promise.$$state.status) {
      return;
    }
    this.promise.$$state.value = reason;
    this.promise.$$state.status = 2;
    scheduleProcessQueue(this.promise.$$state);
  };
  Deferred.prototype.notify = function(progress) {
    var pending = this.promise.$$state.pending;
    if (pending && pending.length &&
        !this.promise.$$state.status) {
      callLater(function() {
        _.forEach(pending, function(handlers) {
          var deferred = handlers[0];
          var progressBack = handlers[3];
          try {
            deferred.notify(_.isFunction(progressBack) ?
                             progressBack(progress) :
                             progress
            );
          } catch (e) {
            console.log(e);
          }
        });
      });
    }
  };

  function defer() {
    return new Deferred();
  }

  function reject(rejection) {
    var d = defer();
    d.reject(rejection);
    return d.promise;
  }

  function when(value, callback, errback, progressback) {
    var d = defer();
    d.resolve(value);
    return d.promise.then(callback, errback, progressback);
  }

  function all(promises) {
    var results = _.isArray(promises) ? [] : {};
    var counter = 0;
    var d = defer();
    _.forEach(promises, function(promise, index) {
      counter++;
      when(promise).then(function(value) {
        results[index] = value;
        counter--;
        if (!counter) {
          d.resolve(results);
        }
      }, function(rejection) {
        d.reject(rejection);
      });
    });
    if (!counter) {
      d.resolve(results);
    }
    return d.promise;
  }

  var $Q = function Q(resolver) {
    if (!_.isFunction(resolver)) {
      throw 'Expected function, got ' + resolver;
    }
    var d = defer();
    resolver(
      _.bind(d.resolve, d),
      _.bind(d.reject, d)
    );
    return d.promise;
  };

  return _.extend($Q, {
    defer: defer,
    reject: reject,
    when: when,
    all: all
  });

}

function $QProvider() {
  this.$get = ['$rootScope', function($rootScope) {
    return qFactory(function(callback) {
      $rootScope.$evalAsync(callback);
    });
  }];
}

function $$QProvider() {
  this.$get = function() {
    return qFactory(function(callback) {
      setTimeout(callback, 0);
    });
  };
}
