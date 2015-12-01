// Load global config and gulp
var config  = require(__dirname + '/config/foley.json');
var argv    = require('yargs').argv;
var gulp    = require('gulp');
var plumber = require('gulp-plumber');
var debug   = require('gulp-debug');
var gulpif  = require('gulp-if');

// Specific task modules
var browserSync = require('browser-sync');
var imagemin    = require('gulp-imagemin');
var pngquant    = require('imagemin-pngquant');

gulp.task('img', function () {
  return gulp.src(config.paths.img + '{,**/}*.{png,jpg,gif,svg}')
    .pipe(gulpif(argv.debug === true, debug({title: 'Images Optimised:'})))
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest(config.paths.buildAssets + 'img'))
    .pipe(browserSync.stream());
});
