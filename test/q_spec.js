'use strict';

var publishExternalAPI = require('../src/angular_public');
var createInjector = require('../src/injector');

describe("$q", function() {

  var $q;

  beforeEach(function() {
    publishExternalAPI();
    $q = createInjector(['ng']).get('$q');
  });

  it('can create a deferred', function() {
    var d = $q.defer();
    expect(d).toBeDefined();
  });

});
