// Load global config and gulp
var config  = require(__dirname + '/config/foley.json');
var argv    = require('yargs').argv;
var gulp    = require('gulp');
var plumber = require('gulp-plumber');
var debug   = require('gulp-debug');
var gulpif  = require('gulp-if');

// Specific task modules
var critical = require('critical').stream;

// HTML minify task
gulp.task('crticalcss', function () {
  return gulp.src(config.paths.build + '/*.html')
    .pipe(gulpif(argv.debug === true, debug({title: 'CSS Inlined:'})))
    .pipe(critical({
      base: config.paths.build + '/',
      width: 320,
      height: 480,
      minify: true,
      extract: false,
      inline: true
    }))
    .pipe(gulp.dest(config.paths.build));
});
