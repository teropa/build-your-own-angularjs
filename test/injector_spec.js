/* jshint globalstrict: true */
/* global createInjector: false, angular: false */
'use strict';

describe('injector', function() {

  it('can be created', function() {
    var injector = createInjector([]);
    expect(injector).toBeDefined();
  });

});
