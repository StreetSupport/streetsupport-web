// Load global config and gulp
var config  = require(__dirname + '/config/foley.json');
var argv    = require('yargs').argv;
var gulp    = require('gulp');
var plumber = require('gulp-plumber');
var debug   = require('gulp-debug');
var gulpif  = require('gulp-if');

// Specific task modules
var htmlmin = require('gulp-htmlmin');

// HTML minify task
gulp.task('html', function () {
  return gulp.src(config.paths.build + '**/*.html')
    .pipe(gulpif(argv.debug === true, debug({title: 'HTML Minified:'})))
    .pipe(gulpif(argv.production === true,
      htmlmin({
        collapseWhitespace: true
      })
    ))
    .pipe(gulp.dest(config.paths.build));
});
