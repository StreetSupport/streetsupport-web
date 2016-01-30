// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import del from 'del'

// Clean task
gulp.task('clean', () => {
  return del([
    config.paths.build,
    config.paths.svgicon
  ])
})
