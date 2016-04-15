// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import { argv as argv } from 'yargs'
import debug from 'gulp-debug'
import gulpif from 'gulp-if'

// Copy files task
gulp.task('copyfiles', () => {
  return gulp.src(config.paths.files + '**/*', {})
  .pipe(gulpif(argv.debug === true, debug({title: 'Files Copied:'})))
  .pipe(gulp.dest(config.paths.build))
})

// Copy fonts task
gulp.task('copyfonts', () => {
  return gulp.src(config.paths.fonts + '**/*', {})
  .pipe(gulpif(argv.debug === true, debug({title: 'Fonts Copied:'})))
  .pipe(gulp.dest(config.paths.buildAssets + 'fonts'))
})

// Main copy task
gulp.task('copy', ['copyfiles', 'copyfonts'])
