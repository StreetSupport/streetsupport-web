// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import { argv as argv } from 'yargs'
import debug from 'gulp-debug'
import gulpif from 'gulp-if'
import browserSync from 'browser-sync'
import Metalsmith from 'metalsmith'
import rename from 'metalsmith-rename'
import htmlmin from 'gulp-htmlmin'

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

  // Rename file extensions
  metalsmith.use(rename([
    [/\.hbs$/, '.html'],
    [/\.md$/, '.html']
  ]))

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

// HTML minify task
gulp.task('html', () => {
  return gulp.src(config.paths.build + '**/*.html')
  .pipe(gulpif(argv.debug === true, debug({title: 'HTML Minified:'})))
  .pipe(gulpif(argv.production === true,
    htmlmin({
      collapseWhitespace: true
    })
  ))
  .pipe(gulp.dest(config.paths.build))
})
