/*jshint globalstrict: true*/
'use strict';

function $InterpolateProvider() {
  var startSymbol = '{{';
  var endSymbol = '}}';

  this.startSymbol = function(value) {
    if (value) {
      startSymbol = value;
      return this;
    } else {
      return startSymbol;
    }
  };

  this.endSymbol = function(value) {
    if (value) {
      endSymbol = value;
      return this;
    } else {
      return endSymbol;
    }
  };

  function stringify(value) {
    if (_.isNull(value) || _.isUndefined(value)) {
      return '';
    } else if (_.isObject(value)) {
      return JSON.stringify(value);
    } else {
      return '' + value;
    }
  }

  function escapeChar(char) {
    return '\\\\\\' + char;
  }

  this.$get = ['$parse', function($parse) {
    var escapedStartMatcher = new RegExp(startSymbol.replace(/./g, escapeChar), 'g');
    var escapedEndMatcher   = new RegExp(endSymbol.replace(/./g, escapeChar), 'g');

    function unescapeText(text) {
      return text.replace(escapedStartMatcher, startSymbol)
                 .replace(escapedEndMatcher, endSymbol);
    }

    function $interpolate(text, mustHaveExpressions) {
      var index = 0;
      var parts = [];
      var expressions = [];
      var expressionFns = [];
      var expressionPositions = [];
      var startIndex, endIndex, exp, expFn;
      while (index < text.length) {
        startIndex = text.indexOf(startSymbol, index);
        if (startIndex !== -1) {
          endIndex = text.indexOf(endSymbol, startIndex + startSymbol.length);
        }
        if (startIndex !== -1 && endIndex !== -1) {
          if (startIndex !== index) {
            parts.push(unescapeText(text.substring(index, startIndex)));
          }
          exp = text.substring(startIndex + startSymbol.length, endIndex);
          expFn = $parse(exp);
          expressions.push(exp);
          expressionFns.push(expFn);
          expressionPositions.push(parts.length);
          parts.push(expFn);
          index = endIndex + endSymbol.length;
        } else {
          parts.push(unescapeText(text.substring(index)));
          break;
        }
      }

      function compute(values) {
        _.forEach(values, function(value, i) {
          parts[expressionPositions[i]] = stringify(value);
        });
        return parts.join('');
      }


      if (expressions.length || !mustHaveExpressions) {
        return _.extend(function interpolationFn(context) {
          var values = _.map(expressionFns, function(expressionFn) {
            return expressionFn(context);
          });
          return compute(values);
        }, {
          expressions: expressions,
          $$watchDelegate: function(scope, listener) {
            var lastValue;
            return scope.$watchGroup(expressionFns, function(newValues, oldValues) {
              var newValue = compute(newValues);
              listener(
                newValue,
                (newValues === oldValues ? newValue : lastValue),
                scope
              );
              lastValue = newValue;
            });
          }
        });
      }

    }

    $interpolate.startSymbol = _.constant(startSymbol);
    $interpolate.endSymbol   = _.constant(endSymbol);

    return $interpolate;
  }];

}
