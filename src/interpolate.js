/*jshint globalstrict: true*/
'use strict';

function $InterpolateProvider() {

  this.$get = ['$parse', function($parse) {

    function $interpolate(text) {
      var index = 0;
      var parts = [];
      var startIndex, endIndex, exp, expFn;
      while (index < text.length) {
        startIndex = text.indexOf('{{', index);
        if (startIndex !== -1) {
          endIndex = text.indexOf('}}', startIndex + 2);
        }
        if (startIndex !== -1 && endIndex !== -1) {
          if (startIndex !== index) {
            parts.push(text.substring(index, startIndex));
          }
          exp = text.substring(startIndex + 2, endIndex);
          expFn = $parse(exp);
          parts.push(expFn);
          index = endIndex + 2;
        } else {
          parts.push(text.substring(index));
          break;
        }
      }

      return function interpolationFn(context) {
        return _.reduce(parts, function(result, part) {
          if (_.isFunction(part)) {
            return result + part(context);
          } else {
            return result + part;
          }
        }, '');
      };

    }

    return $interpolate;
  }];

}
