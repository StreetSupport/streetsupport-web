// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import { argv as argv } from 'yargs'
import debug from 'gulp-debug'
import gulpif from 'gulp-if'
import critical from 'critical'
const criticalcss = critical.stream

// Get breakpoints from foley.json
var dimensions = config.critical.dimensions || {}

// HTML minify task
gulp.task('crticalcss', () => {
  return gulp.src(config.paths.build + '**/*.html')
  .pipe(gulpif(argv.debug === true, debug({title: 'CSS Inlined:'})))
  .pipe(criticalcss({
    base: config.paths.build,
    minify: true,
    extract: false,
    inline: true,
    dimensions: dimensions
  }))
  .pipe(gulp.dest(config.paths.build))
})
