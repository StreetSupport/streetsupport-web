// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import browserSync from 'browser-sync'
import Metalsmith from 'metalsmith'

// Build Metalsmith
function buildMetalsmith (callback) {
  // Metalsmith instance and options
  var metalsmith = new Metalsmith('.').clean(false)
  var plugins = config.metalsmith.plugins || {}
  metalsmith.source(config.paths.pages)
  metalsmith.destination(config.paths.build)

  // For each plugin
  Object.keys(plugins).forEach(function (key) {
    var plugin = require(key) // Require Metalsmith plugins
    var options = plugins[key] // Get options

    // Add plugins to Metalsmith
    metalsmith.use(plugin(options))
  })

  // Build Metalsmith or error out
  metalsmith.build(function (err) {
    if (err) {
      return callback(err)
    }

    browserSync.reload()
    callback()
  })
}

// Metalsmith task
gulp.task('metalsmith', function (callback) {
  buildMetalsmith(callback)
})
