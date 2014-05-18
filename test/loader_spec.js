'use strict';

var setupModuleLoader = require('../src/loader');

describe("setupModuleLoader", function() {

  beforeEach(function() {
    delete window.angular;
  });

  it('exposes angular on the window', function() {
    setupModuleLoader(window);
    expect(window.angular).toBeDefined();
  });

  it('creates angular just once', function() {
    setupModuleLoader(window);
    var ng = window.angular;
    setupModuleLoader(window);
    expect(window.angular).toBe(ng);
  });

});
