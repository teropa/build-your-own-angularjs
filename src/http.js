/* jshint globalstrict: true */
'use strict';

function isSuccess(status) {
  return status >= 200 && status < 300;
}

function isBlob(object) {
  return object.toString() === '[object Blob]';
}
function isFile(object) {
  return object.toString() === '[object File]';
}
function isFormData(object) {
  return object.toString() === '[object FormData]';
}

function isJsonLike(data) {
  if (data.match(/^\{(?!\{)/)) {
    return data.match(/\}$/);
  } else if (data.match(/^\[/)) {
    return data.match(/\]$/);
  }
}

function defaultHttpResponseTransform(data, headers) {
  if (_.isString(data)) {
    var contentType = headers('Content-Type');
    if ((contentType && contentType.indexOf('application/json') === 0) ||
        isJsonLike(data)) {
      return JSON.parse(data);
    }
  }
  return data;
}

function buildUrl(url, params) {
  _.forEach(params, function(value, key) {
    if (_.isNull(value) || _.isUndefined(value)) {
      return;
    }
    if (!_.isArray(value)) {
      value = [value];
    }
    _.forEach(value, function(v) {
      if (_.isObject(v)) {
        v = JSON.stringify(v);
      }
      url += (url.indexOf('?') == -1) ? '?' : '&';
      url += encodeURIComponent(key) + '=' + encodeURIComponent(v);
    });
  });
  return url;
}

function $HttpProvider() {

  var interceptorFactories = this.interceptors = [];

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
    },
    transformRequest: [function(data) {
      if (_.isObject(data) && !isBlob(data) &&
          !isFile(data) && !isFormData(data)) {
        return JSON.stringify(data);
      } else {
        return data;
      }
    }],
    transformResponse: [defaultHttpResponseTransform]
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
    if (_.isObject(headers)) {
      return _.transform(headers, function(result, v, k) {
        result[_.trim(k.toLowerCase())] = _.trim(v);
      }, {});
    } else {
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

  function transformData(data, headers, status, transform) {
    if (_.isFunction(transform)) {
      return transform(data, headers, status);
    } else {
      return _.reduce(transform, function(data, fn) {
        return fn(data, headers, status);
      }, data);
    }
  }

  this.$get = ['$httpBackend', '$q', '$rootScope', '$injector',
    function($httpBackend, $q, $rootScope, $injector) {

    var interceptors = _.map(interceptorFactories, function(fn) {
      return _.isString(fn) ? $injector.get(fn) :
                              $injector.invoke(fn);
    });

    function sendReq(config, reqData) {
      var deferred = $q.defer();

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

      var url = buildUrl(config.url, config.params);

      $httpBackend(
        config.method,
        url,
        reqData,
        done,
        config.headers,
        config.withCredentials
      );

      return deferred.promise;
    }

    function serverRequest(config) {
      if (_.isUndefined(config.withCredentials) &&
          !_.isUndefined(defaults.withCredentials)) {
        config.withCredentials = defaults.withCredentials;
      }

      var reqData = transformData(
        config.data,
        headersGetter(config.headers),
        undefined,
        config.transformRequest
      );

      if (_.isUndefined(reqData)) {
        _.forEach(config.headers, function(v, k) {
          if (k.toLowerCase() === 'content-type') {
            delete config.headers[k];
          }
        });
      }

      function transformResponse(response) {
        if (response.data) {
          response.data = transformData(
            response.data,
            response.headers,
            response.status,
            config.transformResponse
          );
        }
        if (isSuccess(response.status)) {
          return response;
        } else {
          return $q.reject(response);
        }
      }

      return sendReq(config, reqData)
        .then(transformResponse, transformResponse);
    }

    function $http(requestConfig) {
      var config = _.extend({
        method: 'GET',
        transformRequest: defaults.transformRequest,
        transformResponse: defaults.transformResponse
      }, requestConfig);
      config.headers = mergeHeaders(requestConfig);

      var promise = $q.when(config);
      _.forEach(interceptors, function(interceptor) {
        promise = promise.then(interceptor.request, interceptor.requestError);
      });
      promise = promise.then(serverRequest);
      _.forEachRight(interceptors, function(interceptor) {
        promise = promise.then(interceptor.response, interceptor.responseError);
      });
      promise.success = function(fn) {
        promise.then(function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };
      promise.error = function(fn) {
        promise.catch(function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };
      return promise;
    }

    $http.defaults = defaults;
    _.forEach(['get', 'head', 'delete'], function(method) {
      $http[method] = function(url, config) {
        return $http(_.extend(config || {}, {
          method: method.toUpperCase(),
          url: url
        }));
      };
    });
    _.forEach(['post', 'put', 'patch'], function(method) {
      $http[method] = function(url, data, config) {
        return $http(_.extend(config || {}, {
          method: method.toUpperCase(),
          url: url,
          data: data
        }));
      };
    });
    return $http;

  }];

}
