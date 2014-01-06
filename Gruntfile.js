module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      all: ['src/**/*.js'],
      options: {
        globals: {
          _: false,
          $: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

};
