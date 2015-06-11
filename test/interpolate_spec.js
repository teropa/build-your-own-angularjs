describe('$interpolate', function() {

  beforeEach(function() {
    delete window.angular;
    publishExternalAPI();
  });

  it('should exist', function() {
    var injector = createInjector(['ng']);
    expect(injector.has('$interpolate')).toBe(true);
  });

  it('produces an identity function for static content', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('hello');
    expect(interp instanceof Function).toBe(true);
    expect(interp()).toEqual('hello');
  });

  it('evaluates a single expression', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('{{anAttr}}');
    expect(interp({anAttr: '42'})).toEqual('42');
  });

  it('evaluates many expressions', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('First {{anAttr}}, then {{anotherAttr}}!');
    expect(interp({anAttr: '42', anotherAttr: '43'})).toEqual('First 42, then 43!');
  });

  it('passes through ill-defined interpolations', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('why u no }}work{{');
    expect(interp({})).toEqual('why u no }}work{{');
  });

  it('turns nulls into empty strings', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('{{aNull}}');
    expect(interp({aNull: null})).toEqual('');
  });

  it('turns undefineds into empty strings', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('{{anUndefined}}');
    expect(interp({})).toEqual('');
  });

  it('turns numbers into strings', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('{{aNumber}}');
    expect(interp({aNumber: 42})).toEqual('42');
  });

  it('turns booleans into strings', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('{{aBoolean}}');
    expect(interp({aBoolean: true})).toEqual('true');
  });

  it('turns arrays into JSON strings', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('{{anArray}}');
    expect(interp({anArray: [1, 2, [3]]})).toEqual('[1,2,[3]]');
  });

  it('turns objects into JSON strings', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('{{anObject}}');
    expect(interp({anObject: {a: 1, b: '2'}})).toEqual('{"a":1,"b":"2"}');
  });

  it('unescapes escaped sequences', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('\\{\\{expr\\}\\} {{expr}} \\{\\{expr\\}\\}');
    expect(interp({expr: 'value'})).toEqual('{{expr}} value {{expr}}');
  });

  it('does not return function for when flagged and no expressions', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('static content only', true);
    expect(interp).toBeFalsy();
  });

  it('returns function when flagged and has expressions', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');

    var interp = $interpolate('has an {{expr}}', true);
    expect(interp).not.toBeFalsy();
  });

  it('uses a watch delegate', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');
    var interp = $interpolate('has an {{expr}}');
    expect(interp.$$watchDelegate).toBeDefined();
  });

  it('correctly returns new and old value when watched', function() {
    var injector = createInjector(['ng']);
    var $interpolate = injector.get('$interpolate');
    var $rootScope = injector.get('$rootScope');

    var interp = $interpolate('{{expr}}');
    var listenerSpy = jasmine.createSpy();

    $rootScope.$watch(interp, listenerSpy);
    $rootScope.expr = 42;

    $rootScope.$apply();
    expect(listenerSpy.calls.mostRecent().args[0]).toEqual('42');
    expect(listenerSpy.calls.mostRecent().args[1]).toEqual('42');

    $rootScope.expr++;
    $rootScope.$apply();
    expect(listenerSpy.calls.mostRecent().args[0]).toEqual('43');
    expect(listenerSpy.calls.mostRecent().args[1]).toEqual('42');
  });

});
