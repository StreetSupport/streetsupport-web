// Load global config and gulp
var config    = require('../config.json');
var argv      = require('yargs').argv;
var gulp      = require('gulp');
var plumber   = require('gulp-plumber');
var debug     = require('gulp-debug');
var gulpif    = require('gulp-if');

// Specific task modules
// ...

// Copy task
gulp.task('copy', function () {
  return gulp.src(config.paths.files + '**/*', {})
  .pipe(gulpif(argv.debug === true, debug({title: 'Files Copied:'})))
  .pipe(gulp.dest(config.paths.build));
});
