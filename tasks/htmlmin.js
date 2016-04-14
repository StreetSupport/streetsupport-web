// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import { argv as argv } from 'yargs'
import debug from 'gulp-debug'
import gulpif from 'gulp-if'
import htmlmin from 'gulp-htmlmin'

// HTML minify task
gulp.task('htmlmin', () => {
  return gulp.src(config.paths.build + '**/*.html')
  .pipe(gulpif(argv.debug === true, debug({title: 'HTML Minified:'})))
  .pipe(gulpif(argv.production === true,
    htmlmin({
      collapseWhitespace: true
    })
  ))
  .pipe(gulp.dest(config.paths.build))
})
