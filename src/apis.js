/* jshint globalstrict: true */
'use strict';

function hashKey(value) {
  var type = typeof value;
  var uid;
  if (type === 'function' || (type === 'object' && value !== null)) {
    uid = value.$$hashKey;
    if (typeof uid === 'function') {
      uid = value.$$hashKey();
    } else if (uid === undefined) {
      uid =  value.$$hashKey = _.uniqueId();
    }
  } else {
    uid = value;
  }
  return type + ':' + uid;
}

function HashMap() {
}

HashMap.prototype = {
  put: function(key, value) {
    this[hashKey(key)] = value;
  },
  get: function(key) {
    return this[hashKey(key)];
  },
  remove: function(key) {
    key = hashKey(key);
    var value = this[key];
    delete this[key];
    return value;
  }
};
