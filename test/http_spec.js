/* jshint globalstrict: true */
/* global publishExternalAPI: false, createInjector: false */
'use strict';

describe('$http', function() {

  var $http;
  var xhr, requests;

  beforeEach(function() {
    publishExternalAPI();
    var injector = createInjector(['ng']);
    $http = injector.get('$http');
  });

  beforeEach(function() {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function(req) {
      requests.push(req);
    };
  });
  afterEach(function() {
    xhr.restore();
  });

  it('is a function', function() {
    expect($http instanceof Function).toBe(true);
  });

  it('returns a Promise', function() {
    var result = $http({});
    expect(result).toBeDefined();
    expect(result.then).toBeDefined();
  });

  it('makes an XMLHttpRequest to given URL', function() {
    $http({
      method: 'POST',
      url: 'http://teropa.info',
      data: 'hello'
    });
    expect(requests.length).toBe(1);
    expect(requests[0].method).toBe('POST');
    expect(requests[0].url).toBe('http://teropa.info');
    expect(requests[0].async).toBe(true);
    expect(requests[0].requestBody).toBe('hello');
  });

  it('resolves promise when XHR result received', function() {
    var requestConfig = {
      method: 'GET',
      url: 'http://teropa.info'
    };
    var response;

    $http(requestConfig).then(function(r) {
      response = r;
    });

    requests[0].respond(200, {}, 'Hello');

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');
    expect(response.data).toBe('Hello');
    expect(response.config.url).toEqual('http://teropa.info');
  });

  it('rejects promise when XHR result received with error status', function() {
    var requestConfig = {
      method: 'GET',
      url: 'http://teropa.info'
    };

    var response;
    $http(requestConfig).catch(function(r) {
      response = r;
    });

    requests[0].respond(401, {}, 'Fail');

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
    expect(response.statusText).toBe('Unauthorized');
    expect(response.data).toBe('Fail');
    expect(response.config.url).toEqual('http://teropa.info');
  });

  it('rejects promise when XHR result errors/aborts', function() {
    var requestConfig = {
      method: 'GET',
      url: 'http://teropa.info'
    };

    var response;
    $http(requestConfig).catch(function(r) {
      response = r;
    });

    requests[0].onerror();

    expect(response).toBeDefined();
    expect(response.status).toBe(0);
    expect(response.data).toBe(null);
    expect(response.config.url).toEqual('http://teropa.info');
  });

});
