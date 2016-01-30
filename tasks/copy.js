// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import { argv as argv } from 'yargs'
import debug from 'gulp-debug'
import gulpif from 'gulp-if'

// Copy task
gulp.task('copy', () => {
  return gulp.src(config.paths.fonts + '**/*', {})
  .pipe(gulpif(argv.debug === true, debug({title: 'Files Copied:'})))
  .pipe(gulp.dest(config.paths.buildAssets + 'fonts'))
})
