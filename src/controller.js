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

    return function(ctrl, locals, later, identifier) {
      if (_.isString(ctrl)) {
        var match = ctrl.match(/^(\S+)(\s+as\s+(\w+))?/);
        ctrl = match[1];
        identifier = identifier || match[3];
        if (controllers.hasOwnProperty(ctrl)) {
          ctrl = controllers[ctrl];
        } else if (globals) {
          ctrl = window[ctrl];
        }
      }
      var instance;
      if (later) {
        var ctrlConstructor = _.isArray(ctrl) ? _.last(ctrl) : ctrl;
        instance = Object.create(ctrlConstructor.prototype);
        if (identifier) {
          addToScope(locals, identifier, instance);
        }
        return _.extend(function() {
          $injector.invoke(ctrl, instance, locals);
          return instance;
        }, {
          instance: instance
        });
      } else {
        instance = $injector.instantiate(ctrl, locals);
        if (identifier) {
          addToScope(locals, identifier, instance);
        }
        return instance;
      }
    };

  }];

}
