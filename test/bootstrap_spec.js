'use strict';

var $ = require('jquery');
var bootstrap = require('../src/bootstrap');

describe('bootstrap', function() {

  describe('manual', function() {

    it('is available', function() {
      expect(window.angular.bootstrap).toBeDefined();
    });

    it('creates and returns an injector', function() {
      var element = $('<div></div>');
      var injector = window.angular.bootstrap(element);
      expect(injector).toBeDefined();
      expect(injector.invoke).toBeDefined();
    });

    it('attaches the injector to the bootstrapped element', function() {
      var element = $('<div></div>');
      var injector = window.angular.bootstrap(element);
      expect(element.data('$injector')).toBe(injector);
    });

    it('loads built-ins into the injector', function() {
      var element = $('<div></div>');
      window.angular.bootstrap(element);

      var injector = element.data('$injector');
      expect(injector.has('$compile')).toBe(true);
      expect(injector.has('$rootScope')).toBe(true);
    });

    it('loads other specified modules into the injector', function() {
      var element = $('<div></div>');

      window.angular.module('myModule', [])
        .constant('aValue', 42);
      window.angular.module('mySecondModule', [])
        .constant('aSecondValue', 43);
      window.angular.bootstrap(element, ['myModule', 'mySecondModule']);

      var injector = element.data('$injector');
      expect(injector.get('aValue')).toBe(42);
      expect(injector.get('aSecondValue')).toBe(43);
    });

    it('makes root element available for injection', function() {
      var element = $('<div></div>');

      window.angular.bootstrap(element);

      var injector = element.data('$injector');
      expect(injector.has('$rootElement')).toBe(true);
      expect(injector.get('$rootElement')[0]).toBe(element[0]);
    });

    it('compiles the element', function() {
      var element = $('<div><div my-directive></div></div>');
      var compileSpy = jasmine.createSpy();

      window.angular.module('myModule', [])
        .directive('myDirective', function() {
          return {compile: compileSpy};
        });
      window.angular.bootstrap(element, ['myModule']);

      expect(compileSpy).toHaveBeenCalled();
    });

    it('links the element', function() {
      var element = $('<div><div my-directive></div></div>');
      var linkSpy = jasmine.createSpy();

      window.angular.module('myModule', [])
        .directive('myDirective', function() {
          return {link: linkSpy};
        });
      window.angular.bootstrap(element, ['myModule']);

      expect(linkSpy).toHaveBeenCalled();
      expect(linkSpy.calls.mostRecent().args[0]).toEqual(
        element.data('$injector').get('$rootScope')
      );
    });

    it('runs a digest', function() {
      var element = $('<div><div my-directive>{{expr}}</div></div>');
      var linkSpy = jasmine.createSpy();

      window.angular.module('myModule', [])
        .directive('myDirective', function() {
          return {
            link: function(scope) {
              scope.expr = '42';
            }
          };
        });
      window.angular.bootstrap(element, ['myModule']);

      expect(element.find('div').text()).toBe('42');
    });

    it('supports enabling strictDi mode', function() {
      var element = $('<div><div my-directive></div></div>');
      var compileSpy = jasmine.createSpy();

      window.angular.module('myModule', [])
        .constant('aValue', 42)
        .directive('myDirective', function(aValue) {
          return {};
        });

      expect(function() {
        window.angular.bootstrap(element, ['myModule'], {strictDi: true});
      }).toThrow();
    });
    
  });

});
