// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import { argv as argv } from 'yargs'
import debug from 'gulp-debug'
import gulpif from 'gulp-if'
import browserSync from 'browser-sync'

// Sass modules
import sourcemaps from 'gulp-sourcemaps'
import sass from 'gulp-sass'
import postcss from 'gulp-postcss'
import eyeglass from 'eyeglass'
const sassOptions = {} // put whatever eyeglass and node-sass options you need here.

// Postcss output modules
import autoprefixer from 'autoprefixer'
import pxtorem from 'postcss-pxtorem'
import mqpacker from 'css-mqpacker'
import cssnano from 'cssnano'

// Postcss workflow modules
import scss from 'postcss-scss'
import reporter from 'postcss-reporter'
import stylelint from 'stylelint'

// Output specific plugins
const output = [
  autoprefixer({ browsers: config.autoprefixer.browsers }),
  pxtorem({ replace: true }),
  mqpacker({ sort: true })
]

// Add cssnano if there is a production flag
if (argv.production) {
  output.push(cssnano())
}

// Workflow specific plugins
const workflow = [
  stylelint({}),
  reporter({ clearMessages: true })
]

// Sass & Postcss task
gulp.task('scss', () => {
  return gulp.src(config.paths.scss + '**/*.scss')
  .pipe(gulpif(argv.debug === true, debug({title: 'CSS Processed:'})))
  .pipe(gulpif(!argv.production, sourcemaps.init())) // Sourcemaps if there is no production flag
  .pipe(sass(eyeglass(sassOptions)).on('error', sass.logError))
  .pipe(postcss(output))
  .pipe(gulpif(!argv.production, sourcemaps.write('.'))) // Sourcemaps if there is no production flag
  .pipe(gulp.dest(config.paths.buildAssets + 'css'))
  .pipe(browserSync.stream({match: '**/*.css'}))
})

// Stylelint task
gulp.task('scsslint', () => {
  return gulp.src([config.paths.scss + '**/*.scss', '!' + config.paths.scss + 'vendor{,/**}'])
  .pipe(postcss(workflow, {syntax: scss}))
})
