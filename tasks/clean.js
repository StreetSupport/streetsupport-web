// Load global config and gulp
var config    = require('../config.json');
var argv      = require('yargs').argv;
var gulp      = require('gulp');
var plumber   = require('gulp-plumber');
var debug     = require('gulp-debug');
var gulpif    = require('gulp-if');

// Specific task modules
var del = require('del');

// Clean task
gulp.task('clean', function () {
  return del([
    config.paths.build,
    config.paths.svgicon,
  ]);
});
