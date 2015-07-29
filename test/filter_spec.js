'use strict';

var register = require('../src/filter').register;
var filter   = require('../src/filter').filter;

describe("filter", function() {

  it('can be registered and obtained', function() {
    var myFilter = function() { };
    var myFilterFactory = function() {
      return myFilter;
    };
    register('my', myFilterFactory);
    expect(filter('my')).toBe(myFilter);
  });

  it('allows registering multiple filters with an object', function() {
    var myFilter = function() { };
    var myOtherFilter = function() { };
    register({
      my: function() {
        return myFilter;
      },
      myOther: function() {
        return myOtherFilter;
      }
    });

    expect(filter('my')).toBe(myFilter);
    expect(filter('myOther')).toBe(myOtherFilter);
  });

});
