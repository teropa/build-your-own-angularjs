/*jshint globalstrict: true*/
'use strict';

function addToScope(locals, identifier, instance) {
  if (locals && _.isObject(locals.$scope)) {
    locals.$scope[identifier] = instance;
  } else {
    throw 'Cannot export controller as ' + identifier +
    '! No $scope object provided via locals';
  }
}

function $ControllerProvider() {

  var controllers = {};
  var globals = false;

  this.allowGlobals = function() {
    globals = true;
  };

  this.register = function(name, controller) {
    if (_.isObject(name)) {
      _.extend(controllers, name);
    } else {
      controllers[name] = controller;
    }
  };

  this.$get = ['$injector', function($injector) {

    return function(ctrl, locals, identifier) {
      if (_.isString(ctrl)) {
        if (controllers.hasOwnProperty(ctrl)) {
          ctrl = controllers[ctrl];
        } else if (globals) {
          ctrl = window[ctrl];
        }
      }
      var instance = $injector.instantiate(ctrl, locals);
      if (identifier) {
        addToScope(locals, identifier, instance);
      }
      return instance;
    };

  }];

}
