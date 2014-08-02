/* jshint globalstrict: true */
'use strict';

_.mixin({
  isArrayLike: function(obj) {
    if (_.isNull(obj) || _.isUndefined(obj)) {
      return false;
    }
    var length = obj.length;
    return length === 0 ||
      (_.isNumber(length) && length > 0 && (length - 1) in obj);
  },
  camelCase: function(name) {
    return name.replace(/([\:\-\_]+(.))/g, function(match, separator, letter, offset) {
      return offset > 0 ? letter.toUpperCase() : letter;
    });
  }
});
