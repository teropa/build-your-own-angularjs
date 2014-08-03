describe('$compile', function() {

  beforeEach(function() {
    delete window.angular;
    publishExternalAPI();
  });

  function makeInjectorWithDirectives() {
    var args = arguments;
    return createInjector(['ng', function($compileProvider) {
      $compileProvider.directive.apply($compileProvider, args);
    }]);
  }

  it('allows creating directives', function() {
    var myModule = window.angular.module('myModule', []);
    myModule.directive('testing', function() { });
    var injector = createInjector(['ng', 'myModule']);
    expect(injector.has('testingDirective')).toBe(true);
  });

  it('allows creating many directives with the same name', function() {
    var myModule = window.angular.module('myModule', []);
    myModule.directive('testing', _.constant({d: 'one'}));
    myModule.directive('testing', _.constant({d: 'two'}));
    var injector = createInjector(['ng', 'myModule']);

    var result = injector.get('testingDirective');
    expect(result.length).toBe(2);
    expect(result[0].d).toEqual('one');
    expect(result[1].d).toEqual('two');
  });

  it('does not allow a directive called hasOwnProperty', function() {
    var myModule = window.angular.module('myModule', []);
    myModule.directive('hasOwnProperty', function() { });
    expect(function() {
      createInjector(['ng', 'myModule']);
    }).toThrow();
  });

  it('allows creating directives with object notation', function() {
    var myModule = window.angular.module('myModule', []);
    myModule.directive({
      a: function() { },
      b: function() { },
      c: function() { }
    });
    var injector = createInjector(['ng', 'myModule']);

    expect(injector.has('aDirective')).toBe(true);
    expect(injector.has('bDirective')).toBe(true);
    expect(injector.has('cDirective')).toBe(true);
  });

  it('compiles element directives from a single element', function() {
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        compile: function(element) {
          element.data('hasCompiled', true);
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<my-directive></my-directive>');
      $compile(el);
      expect(el.data('hasCompiled')).toBe(true);
    });
  });

  it('compiles element directives found from several elements', function() {
    var idx = 1;
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        compile: function(element) {
          element.data('idx', idx++);
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<my-directive></my-directive><my-directive></my-directive>');
      $compile(el);
      expect(el.eq(0).data('idx')).toBe(1);
      expect(el.eq(1).data('idx')).toBe(2);
    });
  });

  it('compiles element directives from child elements', function() {
    var idx = 1;
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        compile: function(element) {
          element.data('dir', idx++);
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<div><my-directive></my-directive></div>');
      $compile(el);
      expect(el.data('dir')).toBeUndefined();
      expect(el.find('> my-directive').data('dir')).toBe(1);
    });
  });

  it('compiles nested directives', function() {
    var idx = 1;
    var injector = makeInjectorWithDirectives('myDir', function() {
      return {
        compile: function(element) {
          element.data('dir', idx++);
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<my-dir><my-dir><my-dir/></my-dir></my-dir>');
      $compile(el);
      expect(el.data('dir')).toBe(1);
      expect(el.find('> my-dir').data('dir')).toBe(2);
      expect(el.find('> my-dir > my-dir').data('dir')).toBe(3);
    });
  });

});
