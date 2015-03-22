/* jshint globalstrict: true */
'use strict';

function $HttpBackendProvider() {

  this.$get = function() {
    return function(method, url, post, callback, headers) {
      var xhr = new window.XMLHttpRequest();
      xhr.open(method, url, true);
      _.forEach(headers, function(value, key) {
        xhr.setRequestHeader(key, value);
      });
      xhr.send(post || null);
      xhr.onload = function() {
        var response = ('response' in xhr) ? xhr.response :
                                             xhr.responseText;
        var statusText = xhr.statusText || '';
        callback(
          xhr.status,
          response,
          xhr.getAllResponseHeaders(),
          statusText
        );
      };
      xhr.onerror = function() {
        callback(-1, null, '');
      };
    };
  };

}
