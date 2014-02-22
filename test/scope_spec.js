/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

describe("Scope", function() {

  it("can be constructed and used as an object", function() {
    var scope = new Scope();
    scope.aProperty = 1;

    expect(scope.aProperty).toBe(1);
  });

  describe("digest", function() {

    var scope;

    beforeEach(function() {
      scope = new Scope();
    });

    it("calls the listener function of a watch on first $digest", function() {
      var watchFn    = function() { return 'wat'; };
      var listenerFn = jasmine.createSpy();
      scope.$watch(watchFn, listenerFn);

      scope.$digest();
      
      expect(listenerFn).toHaveBeenCalled();
    });

    it("calls the watch function with the scope as the argument", function() {
      var watchFn = jasmine.createSpy();
      var listenerFn = function() { };
      scope.$watch(watchFn, listenerFn);
      
      scope.$digest();
  
      expect(watchFn).toHaveBeenCalledWith(scope);
    });

    it("calls the listener function when the watched value changes", function() {
      scope.someValue = 'a';
      scope.counter = 0;

      scope.$watch(
        function(scope) { return scope.someValue; },
        function(newValue, oldValue, scope) { scope.counter++; }
      );
  
      expect(scope.counter).toBe(0);
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.someValue = 'b';
      expect(scope.counter).toBe(1);
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("calls listener when watch value is first undefined", function() {
      scope.counter = 0;
      
      scope.$watch(
        function(scope) { return scope.someValue; },
        function(newValue, oldValue, scope) { scope.counter++; }
      );

      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it("calls listener with new value as old value the first time", function() {
      scope.someValue = 123;
      var oldValueGiven;
      
      scope.$watch(
        function(scope) { return scope.someValue; },
        function(newValue, oldValue, scope) { oldValueGiven = oldValue; }
      );

      scope.$digest();
      expect(oldValueGiven).toBe(123);
    });

    it("may have watchers that omit the listener function", function() {
      var watchFn = jasmine.createSpy().and.returnValue('something'); scope.$watch(watchFn);
  
      scope.$digest();
  
      expect(watchFn).toHaveBeenCalled();
    });

    it("triggers chained watchers in the same digest", function() {
      scope.name = 'Jane';

      scope.$watch(
        function(scope) { return scope.nameUpper; },
        function(newValue, oldValue, scope) {
          if (newValue) {
            scope.initial = newValue.substring(0, 1) + '.';
          }
        }
      );

      scope.$watch(
        function(scope) { return scope.name; },
        function(newValue, oldValue, scope) {
          if (newValue) {
            scope.nameUpper = newValue.toUpperCase();
          }
        }
      );
  
      scope.$digest();
      expect(scope.initial).toBe('J.');
  
      scope.name = 'Bob';
      scope.$digest();
      expect(scope.initial).toBe('B.');
    });

    it("gives up on the watches after 10 iterations", function() {
      scope.counterA = 0;
      scope.counterB = 0;

      scope.$watch(
        function(scope) { return scope.counterA; },
        function(newValue, oldValue, scope) {
          scope.counterB++;
        }
      );
      scope.$watch(
        function(scope) { return scope.counterB; },
        function(newValue, oldValue, scope) {
          scope.counterA++;
        }
      );

      expect(function() { scope.$digest(); }).toThrow();
    });

    it("ends the digest when the last watch is clean", function() {

      scope.array = _.range(100);
      var watchExecutions = 0;

      _.times(100, function(i) {
        scope.$watch(
          function(scope) {
            watchExecutions++;
            return scope.array[i];
          },
          function(newValue, oldValue, scope) {
          }
        );
      });
      
      scope.$digest();
      expect(watchExecutions).toBe(200);

      scope.array[0] = 420;
      scope.$digest();
      expect(watchExecutions).toBe(301);
    });
    
    it("compares based on value if enabled", function() {
      scope.aValue = [1, 2, 3];
      scope.counter = 0;
      
      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        },
        true
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.aValue.push(4);
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("does not end digest so that new watches are not run", function() {
      scope.aValue = 'abc';
      scope.counter = 0;

      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.$watch(
            function(scope) { return scope.aValue; },
            function(newValue, oldValue, scope) {
              scope.counter++;
            }
          );
        }
      );
      
      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it("correctly handles NaNs", function() {
      scope.number = 0/0; // NaN
      scope.counter = 0;
    
      scope.$watch(
        function(scope) { return scope.number; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it("Executes $eval'ed function and returns result", function() {
      scope.aValue = 42;

      var result = scope.$eval(function(scope) {
        return scope.aValue; 
      });
  
      expect(result).toBe(42);
    });

    it("Passes the second $eval argument straight through", function() {
      scope.aValue = 42;

      var result = scope.$eval(function(scope, arg) {
        return scope.aValue + arg;
      }, 2);
  
      expect(result).toBe(44);
    });

    it("Executes $apply'ed function and starts the digest", function() {
      scope.aValue = 'someValue';
      scope.counter = 0;

      scope.$watch(
        function(scope) {
          return scope.aValue;
        },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);

      scope.$apply(function(scope) {
        scope.aValue = 'someOtherValue';
      });
      expect(scope.counter).toBe(2);
    });

    it("Execute $evalAsync'ed function later in the same cycle", function() {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluated = false;
      scope.asyncEvaluatedImmediately = false;

      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.$evalAsync(function(scope) {
            scope.asyncEvaluated = true;
          });
          scope.asyncEvaluatedImmediately = scope.asyncEvaluated;
        }
      );

      scope.$digest();
      expect(scope.asyncEvaluated).toBe(true);
      expect(scope.asyncEvaluatedImmediately).toBe(false);
    });

    it("executes $evalAsynced functions added by watch functions", function() {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluated = false;

      scope.$watch(
        function(scope) {
          if (!scope.asyncEvaluated) {
            scope.$evalAsync(function(scope) {
              scope.asyncEvaluated = true;
            });
          }
          return scope.aValue;
        },
        function(newValue, oldValue, scope) { }
      );

      scope.$digest();

      expect(scope.asyncEvaluated).toBe(true);
    });

    it("executes $evalAsynced functions even when not dirty", function() {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluatedTimes = 0;

      scope.$watch(
        function(scope) {
          if (scope.asyncEvaluatedTimes < 2) {
            scope.$evalAsync(function(scope) {
              scope.asyncEvaluatedTimes++;
            });
          }
          return scope.aValue;
        },
        function(newValue, oldValue, scope) { }
      );

      scope.$digest();

      expect(scope.asyncEvaluatedTimes).toBe(2);
    });

   it("eventually halts $evalAsyncs added by watches", function() {
      scope.aValue = [1, 2, 3];

      scope.$watch(
        function(scope) {
          scope.$evalAsync(function(scope) { });
          return scope.aValue;
        },
        function(newValue, oldValue, scope) { }
      );

      expect(function() { scope.$digest(); }).toThrow();
    });

  });

});