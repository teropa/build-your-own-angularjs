/* global hashKey: false, HashMap: false */

describe('apis', function() {
  'use strict';

  describe('hashKey', function() {

    it('is undefined:undefined for undefined', function() {
      expect(hashKey(undefined)).toEqual('undefined:undefined');
    });

    it('is object:null for null', function() {
      expect(hashKey(null)).toEqual('object:null');
    });

    it('is boolean:true for true', function() {
      expect(hashKey(true)).toEqual('boolean:true');
    });

    it('is boolean:false for false', function() {
      expect(hashKey(false)).toEqual('boolean:false');
    });

    it('is number:42 for 42', function() {
      expect(hashKey(42)).toEqual('number:42');
    });

    it('is string:42 for "42"', function() {
      expect(hashKey('42')).toEqual('string:42');
    });

    it('is object:[unique id] for objects', function() {
      expect(hashKey({})).toMatch(/^object:\S+$/);
      expect(hashKey({})).not.toEqual(hashKey({}));
    });

    it('is function:[unique id] for functions', function() {
      var fn = function(a) { return a; };
      expect(hashKey(fn)).toMatch(/^function:\S+$/);
    });

    it('is the same key when asked for the same object many times', function() {
      var obj = {};
      expect(hashKey(obj)).toEqual(hashKey(obj));
    });

    it('is the same key when asked for the same function many times', function() {
      var fn = function() { };
      expect(hashKey(fn)).toEqual(hashKey(fn));
    });

    it('does not change when object value changes', function() {
      var obj = {a: 42};
      var hash1 = hashKey(obj);
      obj.a = 43;
      var hash2 = hashKey(obj);
      expect(hash1).toEqual(hash2);
    });

    it('is not the same for different objects even with the same value', function() {
      var obj1 = {a: 42};
      var obj2 = {a: 42};
      expect(hashKey(obj1)).not.toEqual(hashKey(obj2));
    });

    it('is not the same for different identical functions', function() {
      var fn1 = function() { return 42; };
      var fn2 = function() { return 42; };
      expect(hashKey(fn1)).not.toEqual(hashKey(fn2));
    });

    it('stores the hash key in the $$hashKey attribute', function() {
      var obj = {a: 42};
      var hash = hashKey(obj);
      expect(obj.$$hashKey).toEqual(hash.match(/^object:(\S+)$/)[1]);
    });

    it('uses preassigned $$hashKey', function() {
      expect(hashKey({$$hashKey: 42})).toEqual('object:42');
    });

    it('supports a function $$hashKey', function() {
      expect(hashKey({$$hashKey: _.constant(42)})).toEqual('object:42');
    });

    it('calls the function $$hashKey as a method with the correct receiver', function() {
      expect(hashKey({
        myKey: 42,
        $$hashKey: function() {
          return this.myKey;
        }
      })).toEqual('object:42');
    });

  });

  describe('HashMap', function() {

    it('supports put and get of primitives', function() {
      var map = new HashMap();
      map.put(42, 'fourty two');
      expect(map.get(42)).toEqual('fourty two');
    });

    it('supports put and get of objects with hashKey semantics', function() {
      var map = new HashMap();
      var obj = {};
      map.put(obj, 'my value');
      expect(map.get(obj)).toEqual('my value');
      expect(map.get({})).toBeUndefined();
    });

    it('supports remove', function() {
      var map = new HashMap();
      map.put(42, 'fourty two');
      map.remove(42);
      expect(map.get(42)).toBeUndefined();
    });

    it('returns value from remove', function() {
      var map = new HashMap();
      map.put(42, 'fourty two');
      expect(map.remove(42)).toEqual('fourty two');
    });

  });


});
