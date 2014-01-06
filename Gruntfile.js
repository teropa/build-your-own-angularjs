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
    },
    jasmine: {
      unit: {
        src: 'src/**/*.js',
        options: {
          specs: ['test/**/*.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

};
