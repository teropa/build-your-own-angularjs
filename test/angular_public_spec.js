describe('angularPublic', function() {
  'use strict';


  it('sets up the angular object and the module loader', function() {
    publishExternalAPI();

    expect(window.angular).toBeDefined();
    expect(window.angular.module).toBeDefined();
  });

  it('sets up the ng module', function() {
    publishExternalAPI();

    expect(createInjector(['ng'])).toBeDefined();
  });

  it('sets up the $parse service', function() {
    publishExternalAPI();
    var injector = createInjector(['ng']);
    expect(injector.has('$parse')).toBe(true);
  });

  it('sets up the $rootScope', function() {
    publishExternalAPI();
    var injector = createInjector(['ng']);
    expect(injector.has('$rootScope')).toBe(true);
  });

  it('sets up $q', function() {
    publishExternalAPI();
    var injector = createInjector(['ng']);
    expect(injector.has('$q')).toBe(true);
  });

});
