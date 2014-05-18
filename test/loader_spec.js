'use strict';

var setupModuleLoader = require('../src/loader');

describe("setupModuleLoader", function() {

  it('exposes angular on the window', function() {
    setupModuleLoader(window);
    expect(window.angular).toBeDefined();
  });

});
