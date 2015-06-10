'use strict';

function $InterpolateProvider() {

  this.$get = function() {

    function $interpolate() {
    }

    return $interpolate;
  };

}

module.exports = $InterpolateProvider;
