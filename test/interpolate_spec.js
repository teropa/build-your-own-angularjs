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

});
