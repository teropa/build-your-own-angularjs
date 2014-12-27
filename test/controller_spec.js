describe('$controller', function() {

  beforeEach(function() {
    delete window.angular;
    publishExternalAPI();
  });

  it('instantiates controller functions', function() {
    var injector = createInjector(['ng']);
    var $controller = injector.get('$controller');

    function MyController() {
      this.invoked = true;
    }

    var controller = $controller(MyController);

    expect(controller).toBeDefined();
    expect(controller instanceof MyController).toBe(true);
    expect(controller.invoked).toBe(true);
  });

  it('injects dependencies to controller functions', function() {
    var injector = createInjector(['ng', function($provide) {
      $provide.constant('aDep', 42);
    }]);
    var $controller = injector.get('$controller');

    function MyController(aDep) {
      this.theDep = aDep;
    }

    var controller = $controller(MyController);

    expect(controller.theDep).toBe(42);
  });

  it('allows injecting locals to controller functions', function() {
    var injector = createInjector(['ng']);
    var $controller = injector.get('$controller');

    function MyController(aDep) {
      this.theDep = aDep;
    }

    var controller = $controller(MyController, {aDep: 42});

    expect(controller.theDep).toBe(42);
  });

  it('allows registering controllers at config time', function() {
    function MyController() {
    }
    var injector = createInjector(['ng', function($controllerProvider) {
      $controllerProvider.register('MyController', MyController);
    }]);
    var $controller = injector.get('$controller');

    var controller = $controller('MyController');
    expect(controller).toBeDefined();
    expect(controller instanceof MyController).toBe(true);
  });

  it('allows registering several controllers in an object', function() {
    function MyController() { }
    function MyOtherController() { }
    var injector = createInjector(['ng', function($controllerProvider) {
      $controllerProvider.register({
        MyController: MyController,
        MyOtherController: MyOtherController
      });
    }]);
    var $controller = injector.get('$controller');

    var controller = $controller('MyController');
    var otherController = $controller('MyOtherController');

    expect(controller instanceof MyController).toBe(true);
    expect(otherController instanceof MyOtherController).toBe(true);
  });

  it('allows registering controllers through modules', function() {
    var module = angular.module('myModule', []);
    module.controller('MyController', function MyController() { });

    var injector = createInjector(['ng', 'myModule']);
    var $controller = injector.get('$controller');
    var controller = $controller('MyController');

    expect(controller).toBeDefined();
  });

  it('does not normally look controllers up from window', function() {
    window.MyController = function MyController() { };
    var injector = createInjector(['ng']);
    var $controller = injector.get('$controller');

    expect(function() {
      $controller('MyController');
    }).toThrow();
  });

  it('looks up controllers from window when so configured', function() {
    window.MyController = function MyController() { };
    var injector = createInjector(['ng', function($controllerProvider) {
      $controllerProvider.allowGlobals();
    }]);

    var $controller = injector.get('$controller');
    var controller = $controller('MyController');
    expect(controller).toBeDefined();
    expect(controller instanceof window.MyController).toBe(true);
  });

});
