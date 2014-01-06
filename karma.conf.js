module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'src/**/*.js',
      'test/**/*_spec.js'
    ],
    preprocessors: {
      'test/**/*.js': ['jshint'],
      'src/**/*.js': ['jshint']
    },
    browsers: ['PhantomJS']
  })
}
