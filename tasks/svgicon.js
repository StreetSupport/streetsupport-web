// Load global config and gulp
var config    = require('../config.json');
var argv      = require('yargs').argv;
var gulp      = require('gulp');
var plumber   = require('gulp-plumber');
var debug     = require('gulp-debug');
var gulpif    = require('gulp-if');

// Specific task modules
var glob      = require('glob');
var gulpicon  = require('gulpicon/tasks/gulpicon');
var svgConfig = require(__dirname + '/icons/config.js');

// Output folder
svgConfig.dest = config.paths.svgicon;

// Get SVG icons
var svgFiles = glob.sync(config.paths.icons + '*.svg');

// Icon task
gulp.task('svgicon', gulpicon(svgFiles, svgConfig));
