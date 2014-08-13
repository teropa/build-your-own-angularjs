/*jshint globalstrict: true*/
'use strict';

var PREFIX_REGEXP = /(x[\:\-_]|data[\:\-_])/i;
var BOOLEAN_ATTRS = {
  multiple: true,
  selected: true,
  checked: true,
  disabled: true,
  readOnly: true,
  required: true,
  open: true
};
var BOOLEAN_ELEMENTS = {
  INPUT: true,
  SELECT: true,
  OPTION: true,
  TEXTAREA: true,
  BUTTON: true,
  FORM: true,
  DETAILS: true
};

function nodeName(element) {
  return element.nodeName ? element.nodeName : element[0].nodeName;
}

function directiveNormalize(name) {
  return _.camelCase(name.replace(PREFIX_REGEXP, ''));
}

function isBooleanAttribute(node, attrName) {
  return BOOLEAN_ATTRS[attrName] && BOOLEAN_ELEMENTS[node.nodeName];
}

function $CompileProvider($provide) {

  var hasDirectives = {};

  this.directive = function(name, directiveFactory) {
    if (_.isString(name)) {
      if (name === 'hasOwnProperty') {
        throw 'hasOwnProperty is not a valid directive name';
      }
      if (!hasDirectives.hasOwnProperty(name)) {
        hasDirectives[name] = [];
        $provide.factory(name + 'Directive', ['$injector', function($injector) {
          var factories = hasDirectives[name];
          return _.map(factories, function(factory) {
            var directive = $injector.invoke(factory);
            directive.restrict = directive.restrict || 'EA';
            return directive;
          });
        }]);
      }
      hasDirectives[name].push(directiveFactory);
    } else {
      _.forEach(name, function(directiveFactory, name) {
        this.directive(name, directiveFactory);
      }, this);
    }
  };

  this.$get = ['$injector', function($injector) {

    function Attributes(element) {
      this.$$element = element;
    }

    Attributes.prototype.$set = function(key, value, writeAttr) {
      this[key] = value;
      if (writeAttr !== false) {
        this.$$element.attr(key, value);
      }
    };

    function compile($compileNodes) {
      return compileNodes($compileNodes);
    }

    function compileNodes($compileNodes) {
      _.forEach($compileNodes, function(node) {
        var attrs = new Attributes($(node));
        var directives = collectDirectives(node, attrs);
        applyDirectivesToNode(directives, node, attrs);
        if (node.childNodes && node.childNodes.length) {
          compileNodes(node.childNodes);
        }
      });
    }

    function directiveIsMultiElement(name) {
      if (hasDirectives.hasOwnProperty(name)) {
        var directives = $injector.get(name + 'Directive');
        return _.any(directives, {multiElement: true});
      }
      return false;
    }

    function collectDirectives(node, attrs) {
      var directives = [];
      if (node.nodeType === Node.ELEMENT_NODE) {
        var normalizedNodeName = directiveNormalize(nodeName(node).toLowerCase());
        addDirective(directives, normalizedNodeName, 'E');
        _.forEach(node.attributes, function(attr) {
          var attrStartName, attrEndName;
          var name = attr.name;
          var normalizedAttrName = directiveNormalize(name.toLowerCase());
          var isNgAttr = /^ngAttr[A-Z]/.test(normalizedAttrName);
          if (isNgAttr) {
            name = _.snakeCase(
              normalizedAttrName[6].toLowerCase() +
              normalizedAttrName.substring(7),
              '-'
            );
          }
          var directiveNName = normalizedAttrName.replace(/(Start|End)$/, '');
          if (directiveIsMultiElement(directiveNName)) {
            if (/Start$/.test(normalizedAttrName)) {
              attrStartName = name;
              attrEndName = name.substring(0, name.length - 5) + 'end';
              name = name.substring(0, name.length - 6);
            }
          }
          normalizedAttrName = directiveNormalize(name.toLowerCase());
          addDirective(directives, normalizedAttrName, 'A', attrStartName, attrEndName);
          if (isNgAttr || !attrs.hasOwnProperty(normalizedAttrName)) {
            attrs[normalizedAttrName] = attr.value.trim();
            if (isBooleanAttribute(node, normalizedAttrName)) {
              attrs[normalizedAttrName] = true;
            }
          }
        });
        _.forEach(node.classList, function(cls) {
          var normalizedClassName = directiveNormalize(cls);
          addDirective(directives, normalizedClassName, 'C');
        });
      } else if (node.nodeType === Node.COMMENT_NODE) {
        var match = /^\s*directive\:\s*([\d\w\-_]+)/.exec(node.nodeValue);
        if (match) {
          addDirective(directives, directiveNormalize(match[1]), 'M');
        }
      }
      return directives;
    }

    function addDirective(directives, name, mode, attrStartName, attrEndName) {
      if (hasDirectives.hasOwnProperty(name)) {
        var foundDirectives = $injector.get(name + 'Directive');
        var applicableDirectives = _.filter(foundDirectives, function(dir) {
          return dir.restrict.indexOf(mode) !== -1;
        });
        _.forEach(applicableDirectives, function(directive) {
          if (attrStartName) {
            directive = _.create(directive, {$$start: attrStartName, $$end: attrEndName});
          }
          directives.push(directive);
        });
      }
    }

    function applyDirectivesToNode(directives, compileNode, attrs) {
      var $compileNode = $(compileNode);
      _.forEach(directives, function(directive) {
        if (directive.$$start) {
          $compileNode = groupScan(compileNode, directive.$$start, directive.$$end);
        }
        if (directive.compile) {
          directive.compile($compileNode, attrs);
        }
      });
    }

    function groupScan(node, startAttr, endAttr) {
      var nodes = [];
      if (startAttr && node && node.hasAttribute(startAttr)) {
        var depth = 0;
        do {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.hasAttribute(startAttr)) {
              depth++;
            } else if (node.hasAttribute(endAttr)) {
              depth--;
            }
          }
          nodes.push(node);
          node = node.nextSibling;
        } while (depth > 0);
      } else {
        nodes.push(node);
      }
      return $(nodes);
    }

    return compile;
  }];

}
$CompileProvider.$inject = ['$provide'];
