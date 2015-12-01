// Load global config and gulp
var config  = require(__dirname + '/config/foley.json');
var argv    = require('yargs').argv;
var gulp    = require('gulp');
var plumber = require('gulp-plumber');
var debug   = require('gulp-debug');
var gulpif  = require('gulp-if');

// Specific task modules
var browserSync = require('browser-sync');
var sourcemaps  = require('gulp-sourcemaps');
var sass        = require('gulp-sass');
var postcss     = require('gulp-postcss');
var Eyeglass    = require('eyeglass').Eyeglass;

var sassOptions = {}; // put whatever eyeglass and node-sass options you need here.
var eyeglass    = new Eyeglass(sassOptions);

// Postcss workflow modules
var autoprefixer  = require('autoprefixer');
var pxtorem       = require('postcss-pxtorem');
var mqpacker      = require('css-mqpacker');
var cssnano       = require('cssnano');
var stylelint     = require('stylelint');
var reporter      = require('postcss-reporter');

var processors = [
  autoprefixer({ browsers: config.autoprefixer.browsers }),
  pxtorem({
    replace: true
  }),
  mqpacker(),
  stylelint({
    // add config file path - add to this config file
    // @see {@Link https://github.com/stylelint/stylelint/blob/master/docs/user-guide/configuration.md}
    extends: [
      './tasks/config/.stylelint.json'
    ]
  }),
  reporter({
    clearMessages: true
  })
];

// Add cssnano if there is a production flag
if (argv.production) {
  processors.push(cssnano());
}

// Disable import once with gulp until we
// figure out how to make them work together.
eyeglass.enableImportOnce = false;

// Postcss task
gulp.task('scss', function () {
  return gulp.src(config.paths.scss + '**/*.scss')
    .pipe(gulpif(argv.debug === true, debug({title: 'CSS Processed:'})))
    .pipe(gulpif(!argv.production, sourcemaps.init())) // Sourcemaps if there is no production flag
    .pipe(sass(eyeglass.sassOptions()).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulpif(!argv.production, sourcemaps.write('.'))) // Sourcemaps if there is no production flag
    .pipe(gulp.dest(config.paths.buildAssets + 'css'))
    .pipe(browserSync.stream({match: '**/*.css'}));
});
