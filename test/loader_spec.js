/* jshint globalstrict: true */
/* global setupModuleLoader: false */
'use strict';

describe("setupModuleLoader", function() {

  it('exposes angular on the window', function() {
    setupModuleLoader(window);
    expect(window.angular).toBeDefined();
  });

});
