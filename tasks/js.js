// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import gutil from 'gulp-util'
import browserSync from 'browser-sync'
import webpack from 'webpack'
import webpackConfig from '../webpack.config.js'
import standard from 'gulp-standard'

// Webpack build task
gulp.task('webpack', callback => {
  webpack(webpackConfig, function (err, stats) {
    if (err) throw new gutil.PluginError('webpack', err)

    gutil.log('[webpack]', stats.toString({
      colors: true
    }))

    browserSync.reload()
    callback()
  })
})

// Linting task
gulp.task('jslint', () => {
  return gulp.src(config.paths.js + '**/*.js')
  .pipe(standard())
  .pipe(standard.reporter('default', {
    breakOnError: false
  }))
})
