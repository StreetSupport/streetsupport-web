// Load global config and gulp
var config  = require(__dirname + '/config/foley.json');
var argv    = require('yargs').argv;
var gulp    = require('gulp');
var plumber = require('gulp-plumber');
var debug   = require('gulp-debug');
var gulpif  = require('gulp-if');

// Specific task modules
var gutil         = require('gulp-util');
var webpack       = require('webpack');
var webpackConfig = require(__dirname + '/config/webpack.config.js');

// JS task
gulp.task('webpack', function (callback) {
  webpack(webpackConfig, function(err, stats) {
    if(err) throw new gutil.PluginError('webpack', err);
      gutil.log("[webpack]", stats.toString({
        colors: true
      }));
    callback();
  });
});
