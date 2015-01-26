/* jshint globalstrict: true */
'use strict';

function $QProvider() {

  this.$get = function() {

    function Deferred() {
    }

    function defer() {
      return new Deferred();
    }

    return {
      defer: defer
    };

  };

}
