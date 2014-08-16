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
        restrict: 'EACM',
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
        restrict: 'EACM',
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
        restrict: 'EACM',
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
        restrict: 'EACM',
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

  _.forEach(['x', 'data'], function(prefix) {
    _.forEach([':', '-', '_'], function(delim) {

      it('compiles element directives with '+prefix+delim+' prefix', function() {
        var injector = makeInjectorWithDirectives('myDirective', function() {
          return {
            restrict: 'EACM',
            compile: function(element) {
              element.data('hasCompiled', true);
            }
          };
        });
        injector.invoke(function($compile) {
          var el = $('<'+prefix+delim+'my-directive></'+prefix+delim+'my-directive>');
          $compile(el);
          expect(el.data('hasCompiled')).toBe(true);
        });
      });

    });
  });

  it('compiles attribute directives', function() {
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        restrict: 'EACM',
        compile: function(element) {
          element.data('hasCompiled', true);
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<div my-directive></div>');
      $compile(el);
      expect(el.data('hasCompiled')).toBe(true);
    });
  });

  it('compiles attribute directives with prefixes', function() {
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        restrict: 'EACM',
        compile: function(element) {
          element.data('hasCompiled', true);
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<div x:my-directive></div>');
      $compile(el);
      expect(el.data('hasCompiled')).toBe(true);
    });
  });

  it('compiles several attribute directives in an element', function() {
    var injector = makeInjectorWithDirectives({
      myDirective: function() {
        return {
          restrict: 'EACM',
          compile: function(element) {
            element.data('hasCompiled', true);
          }
        };
      },
      mySecondDirective: function() {
        return {
          restrict: 'EACM',
          compile: function(element) {
            element.data('secondCompiled', true);
          }
        };
      }
    });
    injector.invoke(function($compile) {
      var el = $('<div my-directive my-second-directive></div>');
      $compile(el);
      expect(el.data('hasCompiled')).toBe(true);
      expect(el.data('secondCompiled')).toBe(true);
    });
  });

  it('compiles both element and attributes directives in an element', function() {
    var injector = makeInjectorWithDirectives({
      myDirective: function() {
        return {
          restrict: 'EACM',
          compile: function(element) {
            element.data('hasCompiled', true);
          }
        };
      },
      mySecondDirective: function() {
        return {
          restrict: 'EACM',
          compile: function(element) {
            element.data('secondCompiled', true);
          }
        };
      }
    });
    injector.invoke(function($compile) {
      var el = $('<my-directive my-second-directive></my-directive>');
      $compile(el);
      expect(el.data('hasCompiled')).toBe(true);
      expect(el.data('secondCompiled')).toBe(true);
    });
  });

  it('compiles attribute directives with ng-attr prefix', function() {
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        restrict: 'EACM',
        compile: function(element) {
          element.data('hasCompiled', true);
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<div ng-attr-my-directive></div>');
      $compile(el);
      expect(el.data('hasCompiled')).toBe(true);
    });
  });

  it('compiles attribute directives with data:ng-attr prefix', function() {
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        restrict: 'EACM',
        compile: function(element) {
          element.data('hasCompiled', true);
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<div data:ng-attr-my-directive></div>');
      $compile(el);
      expect(el.data('hasCompiled')).toBe(true);
    });
  });

  it('compiles class directives', function() {
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        restrict: 'EACM',
        compile: function(element) {
          element.data('hasCompiled', true);
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<div class="my-directive"></div>');
      $compile(el);
      expect(el.data('hasCompiled')).toBe(true);
    });
  });

  it('compiles several class directives in an element', function() {
    var injector = makeInjectorWithDirectives({
      myDirective: function() {
        return {
          restrict: 'EACM',
          compile: function(element) {
            element.data('hasCompiled', true);
          }
        };
      },
      mySecondDirective: function() {
        return {
          restrict: 'EACM',
          compile: function(element) {
            element.data('secondCompiled', true);
          }
        };
      }
    });
    injector.invoke(function($compile) {
      var el = $('<div class="my-directive my-second-directive unrelated-class"></div>');
      $compile(el);
      expect(el.data('hasCompiled')).toBe(true);
      expect(el.data('secondCompiled')).toBe(true);
    });
  });

  it('compiles class directives with prefixes', function() {
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        restrict: 'EACM',
        compile: function(element) {
          element.data('hasCompiled', true);
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<div class="x-my-directive"></div>');
      $compile(el);
      expect(el.data('hasCompiled')).toBe(true);
    });
  });

  it('compiles comment directives', function() {
    var hasCompiled;
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        restrict: 'EACM',
        compile: function(element) {
          hasCompiled = true;
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<!-- directive: my-directive -->');
      $compile(el);
      expect(hasCompiled).toBe(true);
    });
  });

  _.forEach({
    E:    {element: true,  attribute: false, class: false, comment: false},
    A:    {element: false, attribute: true,  class: false, comment: false},
    C:    {element: false, attribute: false, class: true,  comment: false},
    M:    {element: false, attribute: false, class: false, comment: true},
    EA:   {element: true,  attribute: true,  class: false, comment: false},
    AC:   {element: false, attribute: true,  class: true,  comment: false},
    EAM:  {element: true,  attribute: true,  class: false, comment: true},
    EACM: {element: true,  attribute: true,  class: true,  comment: true},
  }, function(expected, restrict) {

    describe('restricted to '+restrict, function() {

      _.forEach({
        element:   '<my-directive></my-directive>',
        attribute: '<div my-directive></div>',
        class:     '<div class="my-directive"></div>',
        comment:   '<!-- directive: my-directive -->'
      }, function(dom, type) {

        it((expected[type] ? 'matches' : 'does not match') + ' on '+type, function() {
          var hasCompiled = false;
          var injector = makeInjectorWithDirectives('myDirective', function() {
            return {
              restrict: restrict,
              compile: function(element) {
                hasCompiled = true;
              }
            };
          });
          injector.invoke(function($compile) {
            var el = $(dom);
            $compile(el);
            expect(hasCompiled).toBe(expected[type]);
          });
        });

      });

    });

  });

  it('applies to attributes when no restrict given', function() {
    var hasCompiled = false;
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        compile: function(element) {
          hasCompiled = true;
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<div my-directive></div>');
      $compile(el);
      expect(hasCompiled).toBe(true);
    });
  });

  it('does not apply to elements when no restrict given', function() {
    var hasCompiled = false;
    var injector = makeInjectorWithDirectives('myDirective', function() {
      return {
        compile: function(element) {
          hasCompiled = true;
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<my-directive></my-directive>');
      $compile(el);
      expect(hasCompiled).toBe(false);
    });
  });

  it('allows applying a directive to multiple elements', function() {
    var compileEl = false;
    var injector = makeInjectorWithDirectives('myDir', function() {
      return {
        compile: function(element) {
          compileEl = element;
        }
      };
    });
    injector.invoke(function($compile) {
      var el = $('<div my-dir-start></div><span></span><div my-dir-end></div>');
      $compile(el);
      expect(compileEl.length).toBe(3);
    });
  });

  describe('attributes', function() {

    function registerAndCompile(dirName, domString, callback) {
      var injector = makeInjectorWithDirectives(dirName, function() {
        return {
          restrict: 'EACM',
          compile: function(element, attrs) {
            element.data('givenAttrs', attrs);
          }
        };
      });
      injector.invoke(function($compile, $rootScope) {
        var el = $(domString);
        $compile(el);
        callback(el, el.data('givenAttrs'), $rootScope);
      });
    }

    it('passes the element attributes to the compile function', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive my-attr="1" my-other-attr="two"></my-directive>',
        function(element, attrs) {
          expect(attrs.myAttr).toEqual('1');
          expect(attrs.myOtherAttr).toEqual('two');
        }
      );
    });

    it('trims attribute values', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive my-attr=" val "></my-directive>',
        function(element, attrs) {
          expect(attrs.myAttr).toEqual('val');
        }
      );
    });

    it('sets the value of boolean attributes to true', function() {
      registerAndCompile(
        'myDirective',
        '<input my-directive disabled>',
        function(element, attrs) {
          expect(attrs.disabled).toBe(true);
        }
      );
    });

    it('does not set the value of non-standard boolean attributes to true', function() {
      registerAndCompile(
        'myDirective',
        '<input my-directive whatever>',
        function(element, attrs) {
          expect(attrs.whatever).toEqual('');
        }
      );
    });

    it('allows setting attributes', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive attr="true"></my-directive>',
        function(element, attrs) {
          attrs.$set('attr', 'false');
          expect(attrs.attr).toEqual('false');
        }
      );
    });

    it('sets attributes to DOM', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive attr="true"></my-directive>',
        function(element, attrs) {
          attrs.$set('attr', 'false');
          expect(element.attr('attr')).toEqual('false');
        }
      );
    });

    it('does not set attributes to DOM when flag set to false', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive attr="true"></my-directive>',
        function(element, attrs) {
          attrs.$set('attr', 'false', false);
          expect(element.attr('attr')).toEqual('true');
        }
      );
    });

    it('shares attributes between directives', function() {
      var attrs1, attrs2;
      var injector = makeInjectorWithDirectives({
        myDir: function() {
          return {
            compile: function(element, attrs) {
              attrs1 = attrs;
            }
          };
        },
        myOtherDir: function() {
          return {
            compile: function(element, attrs) {
              attrs2 = attrs;
            }
          };
        }
      });
      injector.invoke(function($compile) {
        var el = $('<div my-dir my-other-dir></div>');
        $compile(el);
        expect(attrs1).toBe(attrs2);
      });
    });

    it('sets prop for boolean attributes', function() {
      registerAndCompile(
        'myDirective',
        '<input my-directive>',
        function(element, attrs) {
          attrs.$set('disabled', true);
          expect(element.prop('disabled')).toBe(true);
        }
      );
    });

    it('sets prop for boolean attributes even when not flushing', function() {
      registerAndCompile(
        'myDirective',
        '<input my-directive>',
        function(element, attrs) {
          attrs.$set('disabled', true, false);
          expect(element.prop('disabled')).toBe(true);
        }
      );
    });

    it('denormalizes attribute name when explicitly given', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive some-attribute="42"></my-directive>',
        function(element, attrs) {
          attrs.$set('someAttribute', 43, true, 'some-attribute');
          expect(element.attr('some-attribute')).toEqual('43');
        }
      );
    });

    it('denormalizes attribute by snake-casing when no other means available', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive some-attribute="42"></my-directive>',
        function(element, attrs) {
          attrs.$set('someAttribute', 43);
          expect(element.attr('some-attribute')).toEqual('43');
        }
      );
    });

    it('denormalizes attribute by using original attribute name', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive x-some-attribute="42"></my-directive>',
        function(element, attrs) {
          attrs.$set('someAttribute', 43);
          expect(element.attr('x-some-attribute')).toEqual('43');
        }
      );
    });

    it('does not use ng-attr- prefix in denormalized names', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive ng-attr-some-attribute="42"></my-directive>',
        function(element, attrs) {
          attrs.$set('someAttribute', 43);
          expect(element.attr('some-attribute')).toEqual('43');
        }
      );
    });

    it('uses new attribute name after once given', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive x-some-attribute="42"></my-directive>',
        function(element, attrs) {
          attrs.$set('someAttribute', 43, true, 'some-attribute');
          attrs.$set('someAttribute', 44);

          expect(element.attr('some-attribute')).toEqual('44');
          expect(element.attr('x-some-attribute')).toEqual('42');
        }
      );
    });

    it('calls observer immediately when attribute is $set', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive some-attribute="42"></my-directive>',
        function(element, attrs) {

          var gotValue;
          attrs.$observe('someAttribute', function(value) {
            gotValue = value;
          });

          attrs.$set('someAttribute', '43');

          expect(gotValue).toEqual('43');
        }
      );
    });

    it('calls observer on next $digest after registration', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive some-attribute="42"></my-directive>',
        function(element, attrs, $rootScope) {

          var gotValue;
          attrs.$observe('someAttribute', function(value) {
            gotValue = value;
          });

          $rootScope.$digest();

          expect(gotValue).toEqual('42');
        }
      );
    });

    it('adds an attribute from a class directive', function() {
      registerAndCompile(
        'myDirective',
        '<div class="my-directive"></div>',
        function(element, attrs) {
          expect(attrs.hasOwnProperty('myDirective')).toBe(true);
        }
      );
    });

    it('does not add attribute from class without a directive', function() {
      registerAndCompile(
        'myDirective',
        '<my-directive class="some-class"></my-directive>',
        function(element, attrs) {
          expect(attrs.hasOwnProperty('someClass')).toBe(false);
        }
      );
    });

    it('supports values for class directive attributes', function() {
      registerAndCompile(
        'myDirective',
        '<div class="my-directive: my attribute value"></div>',
        function(element, attrs) {
          expect(attrs.myDirective).toEqual('my attribute value');
        }
      );
    });

    it('terminates class directive attribute value at semicolon', function() {
      registerAndCompile(
        'myDirective',
        '<div class="my-directive: my attribute value; some-other-class"></div>',
        function(element, attrs) {
          expect(attrs.myDirective).toEqual('my attribute value');
        }
      );
    });



  });

});
