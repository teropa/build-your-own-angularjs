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
          specs: ['test/**/*.js'],
          vendor: [
            'node_modules/lodash/lodash.js',
            'node_modules/jquery/dist/jquery.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('default', ['jshint', 'jasmine']);
};
