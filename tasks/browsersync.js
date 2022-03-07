// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import browserSync from 'browser-sync'

// Browsersync task
gulp.task('browsersync', () => {
  browserSync.init({
    notify: false,
    server: {
      baseDir: config.paths.build
    }
    // TODO: Uncomment if it doesn't fix issue regarding build the site locally
    //tunnel: true
  })
})
