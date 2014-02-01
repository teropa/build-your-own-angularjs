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
   
    it("has a $$phase field whose value is the current digest phase", function() {
      scope.aValue = [1, 2, 3];
      scope.phaseInWatchFunction = undefined;
      scope.phaseInListenerFunction = undefined;
      scope.phaseInApplyFunction = undefined;

      scope.$watch(
        function(scope) {
          scope.phaseInWatchFunction = scope.$$phase;
          return scope.aValue;
        },
        function(newValue, oldValue, scope) {
          scope.phaseInListenerFunction = scope.$$phase;
        }
      );

      scope.$apply(function(scope) {
        scope.phaseInApplyFunction = scope.$$phase;
      });

      expect(scope.phaseInWatchFunction).toBe('$digest');
      expect(scope.phaseInListenerFunction).toBe('$digest');
      expect(scope.phaseInApplyFunction).toBe('$apply');
    });

    it("schedules a digest in $evalAsync", function(done) {
      scope.aValue = "abc";
      scope.counter = 0;

      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );

      scope.$evalAsync(function(scope) { });
      expect(scope.counter).toBe(0);

      setTimeout(function() {
        expect(scope.counter).toBe(1);
        done();
      }, 50);
    });

    it("Runs a $$postDigest function after each digest", function() {
      scope.counter = 0;
      scope.$$postDigest(function() {
        scope.counter++;
      });
  
      expect(scope.counter).toBe(0);
      scope.$digest();
  
      expect(scope.counter).toBe(1);
      scope.$digest();
  
      expect(scope.counter).toBe(1);
    });

    it("does not include $$postDigest in the digest", function() {
      scope.aValue = 'original value';

      scope.$$postDigest(function() {
        scope.aValue = 'changed value';
      });
      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.watchedValue = newValue;
        }
      );
  
      scope.$digest();
      expect(scope.watchedValue).toBe('original value');
  
      scope.$digest();
      expect(scope.watchedValue).toBe('changed value');
    });

    it("catches exceptions in watch functions and continues", function() {
      scope.aValue = 'abc';
      scope.counter = 0;

      scope.$watch(
        function(scope) { throw "error"; },
        function(newValue, oldValue, scope) { }
      );
      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it("catches exceptions in listener functions and continues", function() {
      scope.aValue = 'abc';
      scope.counter = 0;

      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          throw "Error";
        }
      );
      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it("catches exceptions in $evalAsync", function(done) {
      scope.aValue = 'abc';
      scope.counter = 0;

      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
      
      scope.$evalAsync(function(scope) {
        throw "Error";
      });

      setTimeout(function() {
        expect(scope.counter).toBe(1);
        done();
      }, 50);
    });

    it("catches exceptions in $$postDigest", function() {
      var didRun = false;
      
      scope.$$postDigest(function() {
        throw "Error";
      });
      scope.$$postDigest(function() {
        didRun = true;
      });
  
      scope.$digest();

      expect(didRun).toBe(true);
    });


    it("allows destroying a $watch with a removal function", function() {
      scope.aValue = 'abc';
      scope.counter = 0;
      
      var destroyWatch = scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.aValue = 'def';
      scope.$digest();
      expect(scope.counter).toBe(2);

      scope.aValue = 'ghi';
      destroyWatch();
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("allows destroying a $watch during digest", function() {
      scope.aValue = 'abc';

      var watchCalls = [];

      scope.$watch(
        function(scope) {
          watchCalls.push('first');
          return scope.aValue;
        }
      );

      var destroyWatch = scope.$watch(
        function(scope) {
          watchCalls.push('second');
          destroyWatch();
        }
      );
      
      scope.$watch(
        function(scope) {
          watchCalls.push('third');
          return scope.aValue;
        }
      );
  
      scope.$digest();
      expect(watchCalls).toEqual(['first', 'second', 'third', 'first', 'third']);
    });

    it("allows a $watch to destroy another during digest", function() {
      scope.aValue = 'abc';
      scope.counter = 0;

      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          destroyWatch();
        }
      );

      var destroyWatch = scope.$watch(
        function(scope) { },
        function(newValue, oldValue, scope) { }
      );

      scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it("allows destroying several $watches during digest", function() {
      scope.aValue = 'abc';
      scope.counter = 0;

      var destroyWatch1 = scope.$watch(
        function(scope) {
          destroyWatch1();
          destroyWatch2();
        }
      );
      var destroyWatch2 = scope.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(0);
    });
    
  });

  describe("inheritance", function() {

    it("inherits the parent's properties", function() {
      var parent = new Scope();
      parent.aValue = [1, 2, 3];
      
      var child = parent.$new();

      expect(child.aValue).toEqual([1, 2, 3]);
    });

    it("does not cause a parent to inherit its properties", function() {
      var parent = new Scope();
      
      var child = parent.$new();
      child.aValue = [1, 2, 3];
  
      expect(parent.aValue).toBeUndefined();
    });

    it("inherits the parent's properties whenever they are defined", function() {
      var parent = new Scope();
      var child = parent.$new();
  
      parent.aValue = [1, 2, 3];
  
      expect(child.aValue).toEqual([1, 2, 3]);
    });

    it("can manipulate a parent scope's property", function() {
      var parent = new Scope();
      var child = parent.$new();

      parent.aValue = [1, 2, 3];
      child.aValue.push(4);
  
      expect(child.aValue).toEqual([1, 2, 3, 4]);
      expect(parent.aValue).toEqual([1, 2, 3, 4]);
    });

    it("can watch a property in the parent", function() {
      var parent = new Scope();
      var child = parent.$new();

      parent.aValue = [1, 2, 3];
      child.counter = 0;

      child.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        },
        true
      );
  
      child.$digest();
      expect(child.counter).toBe(1);
  
      parent.aValue.push(4);
      child.$digest();
      expect(child.counter).toBe(2);
    });

    it("can be nested at any depth", function() {
      var a = new Scope();
      var aa = a.$new();
      var aaa = aa.$new();
      var aab = aa.$new();
      var ab = a.$new();
      var abb = ab.$new();

      a.value = 1;
  
      expect(aa.value).toBe(1);
      expect(aaa.value).toBe(1);
      expect(aab.value).toBe(1);
      expect(ab.value).toBe(1);
      expect(abb.value).toBe(1);

      ab.anotherValue = 2;

      expect(abb.anotherValue).toBe(2);
      expect(aa.anotherValue).toBeUndefined();
      expect(aaa.anotherValue).toBeUndefined();
    });

    it("shadows a parent's property with the same name", function() {
      var parent = new Scope();
      var child = parent.$new();

      parent.name = 'Joe';
      child.name = 'Jill';
  
      expect(child.name).toBe('Jill');
      expect(parent.name).toBe('Joe');
    });

    it("does not shadow members of parent scope's attributes", function() {
      var parent = new Scope();
      var child = parent.$new();

      parent.user = {name: 'Joe'};
      child.user.name = 'Jill';
  
      expect(child.user.name).toBe('Jill');
      expect(parent.user.name).toBe('Jill');
    });

    it("does not digest its parent(s)", function() {
      var parent = new Scope();
      var child = parent.$new();
  
      parent.aValue = 'abc';
      parent.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.aValueWas = newValue;
        }
      );
  
      child.$digest();
      expect(child.aValueWas).toBeUndefined();
    });

    it("keeps a record of its children", function() {
      var parent = new Scope();
      var child1 = parent.$new();
      var child2 = parent.$new();
      var child2_1 = child2.$new();
  
      expect(parent.$$children.length).toBe(2);
      expect(parent.$$children[0]).toBe(child1);
      expect(parent.$$children[1]).toBe(child2);
      expect(child1.$$children.length).toBe(0);
      expect(child2.$$children.length).toBe(1);
      expect(child2.$$children[0]).toBe(child2_1);
    });

    it("digests its children", function() {
      var parent = new Scope();
      var child = parent.$new();
  
      parent.aValue = 'abc';
  
      child.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.aValueWas = newValue;
        }
      );
  
      parent.$digest();
      expect(child.aValueWas).toBe('abc');
    });

    it("digests from root on $apply", function() {
      var parent = new Scope();
      var child = parent.$new();
      var child2 = child.$new();
  
      parent.aValue = 'abc';
      parent.counter = 0;
  
      parent.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );

      child2.$apply(function(scope) { });
      expect(parent.counter).toBe(1);
    });

    it("schedules a digest from root on $evalAsync", function(done) {
      var parent = new Scope();
      var child = parent.$new();
      var child2 = child.$new();
  
      parent.aValue = 'abc';
      parent.counter = 0;
      parent.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );

      child2.$evalAsync(function(scope) { });
      setTimeout(function() {
        expect(parent.counter).toBe(1);
        done();
      }, 50);
    });

    it("does not have access to parent attributes when isolated", function() {
      var parent = new Scope();
      var child = parent.$new(true);
  
      parent.aValue = 'abc';
  
      expect(child.aValue).toBeUndefined();
    });

    it("cannot watch parent attributes when isolated", function() {
      var parent = new Scope();
      var child = parent.$new(true);
  
      parent.aValue = 'abc';
  
      child.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.aValueWas = newValue;
        }
      );

      child.$digest();
      expect(child.aValueWas).toBeUndefined();
    });

    it("digests its isolated children", function() {
      var parent = new Scope();
      var child = parent.$new(true);
  
      child.aValue = 'abc';
  
      child.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.aValueWas = newValue;
        }
      );
  
      parent.$digest();
      expect(child.aValueWas).toBe('abc');
    });

    it("digests from root on $apply when isolated", function() {
      var parent = new Scope();
      var child = parent.$new(true);
      var child2 = child.$new();

      parent.aValue = 'abc';
      parent.counter = 0;
      parent.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );

      child2.$apply(function(scope) { });
      expect(parent.counter).toBe(1);
    });


    it("schedules a digest from root on $evalAsync when isolated", function(done) {
      var parent = new Scope();
      var child = parent.$new(true);
      var child2 = child.$new();
  
      parent.aValue = 'abc';
      parent.counter = 0;
      parent.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );

      child2.$evalAsync(function(scope) { });
      setTimeout(function() {
        expect(parent.counter).toBe(1);
        done();
      }, 50);
    });

    it("executes $evalAsync functions on isolated scopes", function(done) {
      var parent = new Scope();
      var child = parent.$new(true);

      child.$evalAsync(function(scope) {
        scope.didEvalAsync = true;
      });

      setTimeout(function() {
        expect(child.didEvalAsync).toBe(true);
        done();
      }, 100);
    });

    it("executes $$postDigest functions on isolated scopes", function() {
      var parent = new Scope();
      var child = parent.$new(true);

      child.$$postDigest(function() {
        child.didPostDigest = true;
      });
      parent.$digest();

      expect(child.didPostDigest).toBe(true);
    });

    it("is no longer digested when $destroy has been called", function() {
      var parent = new Scope();
      var child = parent.$new();
      
      child.aValue = [1, 2, 3];
      child.counter = 0;
      child.$watch(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        },
        true
      );

      parent.$digest();
      expect(child.counter).toBe(1);
      
      child.aValue.push(4);
      parent.$digest();
      expect(child.counter).toBe(2);
      
      child.$destroy();
      child.aValue.push(5);
      parent.$digest();
      expect(child.counter).toBe(2);
    });

  });

  describe("$watchCollection", function() {
    
    var scope;

    beforeEach(function() {
      scope = new Scope();
    });
      
    it("works like a normal watch for non-collections", function() {
      var valueProvided;

      scope.aValue = 42;
      scope.counter = 0;

      scope.$watchCollection(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          valueProvided = newValue;
          scope.counter++;
        }
      );

      scope.$digest();
      expect(scope.counter).toBe(1);
      expect(valueProvided).toBe(scope.aValue);

      scope.aValue = 43;
      scope.$digest();
      expect(scope.counter).toBe(2);

      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("works like a normal watch for NaNs", function() {
      scope.aValue = 0/0;
      scope.counter = 0;

      scope.$watchCollection(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );

      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it("notices when the value becomes an array", function() {
      scope.counter = 0;

      scope.$watchCollection(
        function(scope) { return scope.arr; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );

      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.arr = [1, 2, 3];
      scope.$digest();
      expect(scope.counter).toBe(2);
  
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("notices an item added to an array", function() {
      scope.arr = [1, 2, 3];
      scope.counter = 0;

      scope.$watchCollection(
        function(scope) { return scope.arr; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );

      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.arr.push(4);
      scope.$digest();
      expect(scope.counter).toBe(2);
  
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("notices an item removed from an array", function() {
      scope.arr = [1, 2, 3];
      scope.counter = 0;

      scope.$watchCollection(
        function(scope) { return scope.arr; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
      
      scope.arr.shift();
      scope.$digest();
      expect(scope.counter).toBe(2);
    
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("notices an item replaced in an array", function() {
      scope.arr = [1, 2, 3];
      scope.counter = 0;

      scope.$watchCollection(
        function(scope) { return scope.arr; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.arr[1] = 42;
      scope.$digest();
      expect(scope.counter).toBe(2);

      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("notices items reordered in an array", function() {
      scope.arr = [2, 1, 3];
      scope.counter = 0;

      scope.$watchCollection(
        function(scope) { return scope.arr; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.arr.sort();
      scope.$digest();
      expect(scope.counter).toBe(2);
  
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("notices an item replaced in an arguments object", function() {
      (function() {
        scope.arrayLike = arguments;
      })(1, 2, 3);
      scope.counter = 0;

      scope.$watchCollection(
        function(scope) { return scope.arrayLike; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.arrayLike[1] = 42;
      scope.$digest();
      expect(scope.counter).toBe(2);
  
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("notices an item replaced in a NodeList object", function() {
      document.documentElement.appendChild(document.createElement('div'));
      scope.arrayLike = document.getElementsByTagName('div');
      scope.counter = 0;

      scope.$watchCollection(
        function(scope) { return scope.arrayLike; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      document.documentElement.appendChild(document.createElement('div'));
      scope.$digest();
      expect(scope.counter).toBe(2);
      
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("notices when the value becomes an object", function() {
      scope.counter = 0;

      scope.$watchCollection(
        function(scope) { return scope.obj; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.obj = {a: 1};
      scope.$digest();
      expect(scope.counter).toBe(2);
  
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("notices when an attribute is added to an object", function() {
      scope.counter = 0;
      scope.obj = {a: 1};

      scope.$watchCollection(
        function(scope) { return scope.obj; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.obj.b = 2;
      scope.$digest();
      expect(scope.counter).toBe(2);
  
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("notices when an attribute is changed in an object", function() {
      scope.counter = 0;
      scope.obj = {a: 1};

      scope.$watchCollection(
        function(scope) { return scope.obj; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);
  
      scope.obj.a = 2;
      scope.$digest();
  
      expect(scope.counter).toBe(2);
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("notices when an attribute is removed from an object", function() {
      scope.counter = 0;
      scope.obj = {a: 1};

      scope.$watchCollection(
        function(scope) { return scope.obj; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();
      expect(scope.counter).toBe(1);

      delete scope.obj.a;
      scope.$digest();
      expect(scope.counter).toBe(2);
  
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it("does not consider any object with a length property an array", function() {
      scope.obj = {length: 42, otherKey: 'abc'};
      scope.counter = 0;

      scope.$watchCollection(
        function(scope) { return scope.obj; },
        function(newValue, oldValue, scope) {
          scope.counter++;
        }
      );
  
      scope.$digest();

      scope.obj.newKey = 'def';
      scope.$digest();

      expect(scope.counter).toBe(2);
    });

    it("gives the old non-collection value to listeners", function() {
      scope.aValue = 42;
      var oldValueGiven;

      scope.$watchCollection(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          oldValueGiven = oldValue;
        }
      );

      scope.$digest();

      scope.aValue = 43;
      scope.$digest();

      expect(oldValueGiven).toBe(42);
    });

    it("gives the old array value to listeners", function() {
      scope.aValue = [1, 2, 3];
      var oldValueGiven;

      scope.$watchCollection(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          oldValueGiven = oldValue;
        }
      );

      scope.$digest();

      scope.aValue.push(4);
      scope.$digest();

      expect(oldValueGiven).toEqual([1, 2, 3]);
    });

    it("gives the old object value to listeners", function() {
      scope.aValue = {a: 1, b: 2};
      var oldValueGiven;

      scope.$watchCollection(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          oldValueGiven = oldValue;
        }
      );

      scope.$digest();

      scope.aValue.c = 3;
      scope.$digest();

      expect(oldValueGiven).toEqual({a: 1, b: 2});
    });

    it("uses the new value as the old value on first digest", function() {
      scope.aValue = {a: 1, b: 2};
      var oldValueGiven;

      scope.$watchCollection(
        function(scope) { return scope.aValue; },
        function(newValue, oldValue, scope) {
          oldValueGiven = oldValue;
        }
      );

      scope.$digest();

      expect(oldValueGiven).toEqual({a: 1, b: 2});
    });

    
  });

  describe("Events", function() {
    var parent;
    var scope;
    var child;
    var isolatedChild;
  
    beforeEach(function() {
      parent = new Scope();
      scope = parent.$new();
      child = scope.$new();
      isolatedChild = scope.$new(true);
    });

    it("allows registering listeners", function() {
      var listener1 = function() { };
      var listener2 = function() { };
      var listener3 = function() { };

      scope.$on('someEvent', listener1);
      scope.$on('someEvent', listener2);
      scope.$on('someOtherEvent', listener3);

      expect(scope.$$listeners).toEqual({
        someEvent: [listener1, listener2],
        someOtherEvent: [listener3]
      });
    });

    it("registers different listeners for every scope", function() {
      var listener1 = function() { };
      var listener2 = function() { };
      var listener3 = function() { };
  
      scope.$on('someEvent', listener1);
      child.$on('someEvent', listener2);
      isolatedChild.$on('someEvent', listener3);
  
      expect(scope.$$listeners).toEqual({someEvent: [listener1]});
      expect(child.$$listeners).toEqual({someEvent: [listener2]});
      expect(isolatedChild.$$listeners).toEqual({someEvent: [listener3]});
    });

    ['$emit', '$broadcast'].forEach(function(method) {

      it("calls listeners registered for matching events on "+method, function() {
        var listener1 = jasmine.createSpy();
        var listener2 = jasmine.createSpy();
    
        scope.$on('someEvent', listener1);
        scope.$on('someOtherEvent', listener2);

        scope[method]('someEvent');

        expect(listener1).toHaveBeenCalled();
        expect(listener2).not.toHaveBeenCalled();
      });

      it("passes an event object with a name to listeners on "+method, function() { 
        var listener = jasmine.createSpy();
        scope.$on('someEvent', listener);

        scope[method]('someEvent');
  
        expect(listener).toHaveBeenCalled();
        expect(listener.calls.mostRecent().args[0].name).toEqual('someEvent');
      });

      it("passes the same event object to each listener on "+method, function() {
        var listener1 = jasmine.createSpy();
        var listener2 = jasmine.createSpy();
        scope.$on('someEvent', listener1);
        scope.$on('someEvent', listener2);
  
        scope[method]('someEvent');

        var event1 = listener1.calls.mostRecent().args[0];
        var event2 = listener2.calls.mostRecent().args[0];
        expect(event1).toBe(event2);
      });

    });

  });

});