// Load global config and gulp
var config  = require(__dirname + '/config/foley.json');
var argv    = require('yargs').argv;
var gulp    = require('gulp');
var plumber = require('gulp-plumber');
var debug   = require('gulp-debug');
var gulpif  = require('gulp-if');

// Specific task modules
var browserSync = require('browser-sync');

// Browsersync task
gulp.task('browsersync', function () {
  browserSync.init({
    notify: false,
    server: {
      baseDir: config.paths.build,
    }
  });
});
