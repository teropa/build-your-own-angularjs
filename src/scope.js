function Scope() {
	this.$$watchers = [];
  this.$$lastDirtyWatch = null;
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn || function() { }
  };
  this.$$watchers.push(watcher);
};


Scope.prototype.$digest = function() {
  var ttl = 10;
  var dirty;
  this.$$lastDirtyWatch = null;
  do {
    dirty = this.$$digestOnce();
    if (dirty && !(ttl--)) {
      throw "10 digest iterations reached";
    }
  } while (dirty);
};

Scope.prototype.$$digestOnce = function() {
  var self = this;
  var dirty;
  this.$$watchers.every(function(watcher) {
    var newValue = watcher.watchFn(self);
    var oldValue = watcher.last;
    if (newValue !== oldValue) {
      watcher.listenerFn(newValue, oldValue, self);
      dirty = true;
      self.$$lastDirtyWatch = watcher;
    } else if (self.$$lastDirtyWatch === watcher) {
      return false;
    }
    watcher.last = newValue;
    return true;
  });
  return dirty;
};
