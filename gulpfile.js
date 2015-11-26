// Load global config and gulp
var config    = require('./config.json');
var argv      = require('yargs').argv;
var browserSync = require('browser-sync');
var gulp      = require('gulp');
var watch     = require('gulp-watch');
var plumber   = require('gulp-plumber');
var debug     = require('gulp-debug');
var gulpif    = require('gulp-if');

// Load modules to run tasks from files
var requireDir   = require('require-dir');
var tasks        = requireDir('./tasks');
var runSequence  = require('run-sequence');

// Assets task. Metalsmith needs to run first
gulp.task('assets', function(callback) {
  runSequence(
    'metalsmith',
    ['svgicon', 'scss', 'webpack', 'img', 'copy', 'html'],
    callback
  );
});

// BrowserSync reload task
gulp.task('reload', function(callback) {
  browserSync.reload();
  callback();
});

// Rebuild JS task.
// We need to manually reload BrowserSync after
gulp.task('rebuildJs', function(callback) {
  runSequence(
    'webpack',
    'reload',
    callback
  );
});

// Rebuild Metalsmith task. Needed because Metalsmith doesn't do incrimental builds
// We need to manually reload BrowserSync after
gulp.task('rebuildMetalsmith', function(callback) {
  runSequence(
    'assets',
    'reload',
    callback
  );
});

// Watch task
gulp.task('watch', function(callback) {
  gulp.watch(config.paths.scss + '**/*.scss', ['scss']);
  gulp.watch(config.paths.js + '**/*.js', ['rebuildJs']);
  gulp.watch(config.paths.img + '{,**/}*.{png,jpg,gif,svg}', ['img']);
  gulp.watch(config.paths.icons + '**/*.svg', ['svgicon']);
  gulp.watch([config.paths.pages + '**/*.hbs', config.paths.partials + '**/*.hbs'], ['rebuildMetalsmith']);
});

// Build website with development assets and run server with live reloading
gulp.task('default', function(callback) {
  runSequence(
    'clean',
    'assets',
    'browsersync',
    'watch',
    callback
  );
});

// Build website, either with development or minified assets depending on flag
gulp.task('deploy', function(callback) {
  runSequence(
    'clean',
    'assets',
    callback
  );
});
