/* jshint globalstrict: true */
'use strict';

function isSuccess(status) {
  return status >= 200 && status < 300;
}

function $HttpProvider() {

  var defaults = this.defaults = {
    headers: {
      common: {
        Accept: 'application/json, text/plain, */*'
      },
      post: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      put: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      patch: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    }
  };

  function executeHeaderFns(headers, config) {
    return _.transform(headers, function(result, v, k) {
      if (_.isFunction(v)) {
        v = v(config);
        if (_.isNull(v) || _.isUndefined(v)) {
          delete result[k];
        } else {
          result[k] = v;
        }
      }
    }, headers);
  }

  function mergeHeaders(config) {
    var reqHeaders = _.extend(
      {},
      config.headers
    );
    var defHeaders = _.extend(
      {},
      defaults.headers.common,
      defaults.headers[(config.method || 'get').toLowerCase()]
    );
    _.forEach(defHeaders, function(value, key) {
      var headerExists = _.any(reqHeaders, function(v, k) {
        return k.toLowerCase() === key.toLowerCase();
      });
      if (!headerExists) {
        reqHeaders[key] = value;
      }
    });
    return executeHeaderFns(reqHeaders, config);
  }

  function parseHeaders(headers) {
    var lines = headers.split('\n');
    return _.transform(lines, function(result, line) {
      var separatorAt = line.indexOf(':');
      var name = _.trim(line.substr(0, separatorAt)).toLowerCase();
      var value = _.trim(line.substr(separatorAt + 1));
      if (name) {
        result[name] = value;
      }
    }, {});
  }

  function headersGetter(headers) {
    var headersObj;
    return function(name) {
      headersObj = headersObj || parseHeaders(headers);
      if (name) {
        return headersObj[name.toLowerCase()];
      } else {
        return headersObj;
      }
    };
  }


  this.$get = ['$httpBackend', '$q', '$rootScope', function($httpBackend, $q, $rootScope) {

    function $http(requestConfig) {
      var deferred = $q.defer();

      var config = _.extend({
        method: 'GET'
      }, requestConfig);
      config.headers = mergeHeaders(requestConfig);

      if (_.isUndefined(config.data)) {
        _.forEach(config.headers, function(v, k) {
          if (k.toLowerCase() === 'content-type') {
            delete config.headers[k];
          }
        });
      }

      function done(status, response, headersString, statusText) {
        status = Math.max(status, 0);
        deferred[isSuccess(status) ? 'resolve' : 'reject']({
          status: status,
          data: response,
          statusText: statusText,
          headers: headersGetter(headersString),
          config: config
        });
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      }

      $httpBackend(config.method, config.url, config.data, done, config.headers);
      return deferred.promise;
    }
    $http.defaults = defaults;
    return $http;

  }];

}
