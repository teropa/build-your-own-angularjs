/* jshint globalstrict: true */
/* global publishExternalAPI: false, createInjector: false */
'use strict';

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
