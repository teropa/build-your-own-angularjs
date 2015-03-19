/* jshint globalstrict: true */
'use strict';

function isSuccess(status) {
  return status >= 200 && status < 300;
}

function $HttpProvider() {

  this.$get = ['$httpBackend', '$q', '$rootScope', function($httpBackend, $q, $rootScope) {

    return function(requestConfig) {
      var deferred = $q.defer();

      var config = _.extend({
        method: 'GET'
      }, requestConfig);

      function done(status, response, statusText) {
        status = Math.max(status, 0);
        deferred[isSuccess(status) ? 'resolve' : 'reject']({
          status: status,
          data: response,
          statusText: statusText,
          config: config
        });
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      }

      $httpBackend(config.method, config.url, config.data, done);
      return deferred.promise;
    };

  }];

}
