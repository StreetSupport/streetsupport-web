// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import { argv as argv } from 'yargs'
import debug from 'gulp-debug'
import gulpif from 'gulp-if'
import browserSync from 'browser-sync'
import imagemin from 'gulp-imagemin'
import pngquant from 'imagemin-pngquant'

// Image minification task
gulp.task('img', () => {
  return gulp.src(config.paths.img + '{,**/}*.{png,jpg,gif,svg}')
  .pipe(gulpif(argv.debug === true, debug({title: 'Images Optimised:'})))
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  }))
  .pipe(gulp.dest(config.paths.buildAssets + 'img'))
  .pipe(browserSync.stream())
})
