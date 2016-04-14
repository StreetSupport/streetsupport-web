'use strict'

// Load global config and gulp
import config from './foley.json'
import gulp from 'gulp'

// Load modules to run tasks from files
import requireDir from 'require-dir'
import runSequence from 'run-sequence'
const tasks = requireDir(__dirname + '/tasks') // eslint-disable-line

// Watch task
gulp.task('watch', () => {
  gulp.watch(config.paths.scss + '**/*.scss', ['scss'])
  gulp.watch(config.paths.spec + '**/*[Ss]pec.js', ['jasmine'])
  gulp.watch(config.paths.js + '**/*.js', ['jasmine', 'jslint', 'webpack'])
  gulp.watch(config.paths.img + '{,**/}*.{png,jpg,gif,svg}', ['img'])
  gulp.watch(config.paths.icons + '**/*.svg', ['svgsprite'])
  gulp.watch([config.paths.fonts + '**/*', config.paths.files + '**/*'], ['copy'])
  gulp.watch([config.paths.layouts + '**/*.hbs', config.paths.pages + '**/*.hbs', config.paths.partials + '**/*.hbs'], ['metalsmith'])
})

// jsdev Watch task
gulp.task('jsdevwatch', () => {
  gulp.watch(config.paths.spec + '**/*[Ss]pec.js', ['jasmine', 'specsjslint'])
  gulp.watch(config.paths.js + '**/*.js', ['jasmine'])
})

// Build website, either with development or minified assets and run server with live reloading
gulp.task('default', callback => {
  runSequence(
    'jasmine',
    'jslint',
    'clean',
    'metalsmith',
    ['htmlmin', 'svgsprite', 'scss', 'webpack', 'img', 'copy'],
    ['browsersync', 'watch'],
    callback
  )
})

// Build website, either with development or minified assets depending on flag
gulp.task('deploy', callback => {
  runSequence(
    'jasmine',
    'jslint',
    'clean',
    'metalsmith',
    ['htmlmin', 'svgsprite', 'scss', 'webpack', 'img', 'copy'],
    'crticalcss',
    callback
  )
})

// Run tests and watch js/spec files
gulp.task('jsdev', callback => {
  runSequence(
    'jasmine',
    'specsjslint',
    'jsdevwatch',
    callback
  )
})

// Run the audit task to check code standards
gulp.task('auditcode', callback => {
  runSequence(
    'scsslint',
    'jslint',
    callback
  )
})
