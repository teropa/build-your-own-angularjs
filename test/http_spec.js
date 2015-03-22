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

  it('uses GET method by default', function() {
    $http({
      url: 'http://teropa.info'
    });
    expect(requests.length).toBe(1);
    expect(requests[0].method).toBe('GET');
  });

  it('sets headers on request', function() {
    $http({
      url: 'http://teropa.info',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });
    expect(requests.length).toBe(1);
    expect(requests[0].requestHeaders.Accept).toBe('text/plain');
    expect(requests[0].requestHeaders['Cache-Control']).toBe('no-cache');
  });

  it('sets default headers on request', function() {
    $http({
      url: 'http://teropa.info'
    });
    expect(requests.length).toBe(1);
    expect(requests[0].requestHeaders.Accept).toBe('application/json, text/plain, */*');
  });

  it('sets method-specific default headers on request', function() {
    $http({
      method: 'POST',
      url: 'http://teropa.info',
      data: '42'
    });
    expect(requests.length).toBe(1);
    expect(requests[0].requestHeaders['Content-Type']).toBe('application/json;charset=utf-8');
  });

  it('exposes default headers for overriding', function() {
    $http.defaults.headers.post['Content-Type'] = 'text/plain;charset=utf-8';
    $http({
      method: 'POST',
      url: 'http://teropa.info',
      data: '42'
    });
    expect(requests.length).toBe(1);
    expect(requests[0].requestHeaders['Content-Type']).toBe('text/plain;charset=utf-8');
  });

  it('exposes default headers through provider', function() {
    var injector = createInjector(['ng', function($httpProvider) {
      $httpProvider.defaults.headers.post['Content-Type'] = 'text/plain;charset=utf-8';
    }]);
    $http = injector.get('$http');

    $http({
      method: 'POST',
      url: 'http://teropa.info',
      data: '42'
    });
    expect(requests.length).toBe(1);
    expect(requests[0].requestHeaders['Content-Type']).toBe('text/plain;charset=utf-8');
  });

  it('merges default headers case-insensitively', function() {
    $http({
      method: 'POST',
      url: 'http://teropa.info',
      data: '42',
      headers: {
        'content-type': 'text/plain;charset=utf-8'
      }
    });
    expect(requests.length).toBe(1);
    expect(requests[0].requestHeaders['content-type']).toBe('text/plain;charset=utf-8');
    expect(requests[0].requestHeaders['Content-Type']).toBeUndefined();
  });

  it('does not send content-type header when no data', function() {
    $http({
      method: 'POST',
      url: 'http://teropa.info',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
    expect(requests.length).toBe(1);
    expect(requests[0].requestHeaders['Content-Type']).not.toBe('application/json;charset=utf-8');
  });

  it('supports functions as header values', function() {
    var contentTypeSpy = jasmine.createSpy().and.returnValue('text/plain;charset=utf-8');
    $http.defaults.headers.post['Content-Type'] = contentTypeSpy;

    var request = {
      method: 'POST',
      url: 'http://teropa.info',
      data: 42
    };
    $http(request);

    expect(contentTypeSpy).toHaveBeenCalledWith(request);
    expect(requests[0].requestHeaders['Content-Type']).toBe('text/plain;charset=utf-8');
  });

  it('ignores header function value when null/undefined', function() {
    var cacheControlSpy = jasmine.createSpy().and.returnValue(null);
    $http.defaults.headers.post['Cache-Control'] = cacheControlSpy;

    var request = {
      method: 'POST',
      url: 'http://teropa.info',
      data: 42
    };
    $http(request);

    expect(cacheControlSpy).toHaveBeenCalledWith(request);
    expect(requests[0].requestHeaders['Cache-Control']).toBeUndefined();
  });

});
