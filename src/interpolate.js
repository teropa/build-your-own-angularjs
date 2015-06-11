/*jshint globalstrict: true*/
'use strict';

function $InterpolateProvider() {

  function stringify(value) {
    if (_.isNull(value) || _.isUndefined(value)) {
      return '';
    } else if (_.isObject(value)) {
      return JSON.stringify(value);
    } else {
      return '' + value;
    }
  }

  function unescapeText(text) {
    return text.replace(/\\{\\{/g, '{{')
               .replace(/\\}\\}/g, '}}');
  }

  this.$get = ['$parse', function($parse) {

    function $interpolate(text, mustHaveExpressions) {
      var index = 0;
      var parts = [];
      var expressions = [];
      var startIndex, endIndex, exp, expFn;
      while (index < text.length) {
        startIndex = text.indexOf('{{', index);
        if (startIndex !== -1) {
          endIndex = text.indexOf('}}', startIndex + 2);
        }
        if (startIndex !== -1 && endIndex !== -1) {
          if (startIndex !== index) {
            parts.push(unescapeText(text.substring(index, startIndex)));
          }
          exp = text.substring(startIndex + 2, endIndex);
          expFn = $parse(exp);
          parts.push(expFn);
          expressions.push(exp);
          index = endIndex + 2;
        } else {
          parts.push(unescapeText(text.substring(index)));
          break;
        }
      }

      if (expressions.length || !mustHaveExpressions) {
        return _.extend(function interpolationFn(context) {
          return _.reduce(parts, function(result, part) {
            if (_.isFunction(part)) {
              return result + stringify(part(context));
            } else {
              return result + part;
            }
          }, '');
        }, {
          expressions: expressions
        });
      }

    }

    return $interpolate;
  }];

}
