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
  gulp.watch(config.paths.js + '**/*.js', ['run-jasmine', 'webpack'])
  gulp.watch(config.paths.img + '{,**/}*.{png,jpg,gif,svg}', ['img'])
  gulp.watch(config.paths.icons + '**/*.svg', ['svgicon'])
  gulp.watch(config.paths.fonts + '**/*', ['copy'])
  gulp.watch(config.paths.specs + '**/*[Ss]pec.js', ['run-jasmine'])
  gulp.watch([config.paths.data + '**/*', config.paths.layouts + '**/*', config.paths.pages + '**/*', config.paths.partials + '**/*'], ['metalsmith'])
})

// JS Dev Watch task
gulp.task('dev-watch', () => {
  gulp.watch(config.paths.specs + '**/*[Ss]pec.js', ['run-jasmine'])
  gulp.watch(config.paths.js + '**/*.js', ['run-jasmine'])
})

// Build website, either with development or minified assets and run server with live reloading
gulp.task('default', callback => {
  runSequence(
    'run-jasmine',
    'clean',
    'metalsmith',
    ['html', 'svgicon', 'scss', 'webpack', 'img', 'copy'],
    ['browsersync', 'watch'],
    callback
  )
})

// Run tests and watch js/spec files
gulp.task('dev', callback => {
  runSequence(
    'run-jasmine',
    'dev-watch',
    callback
  )
})

// Build website, either with development or minified assets depending on flag
gulp.task('deploy', callback => {
  runSequence(
    'run-jasmine',
    'clean',
    'metalsmith',
    ['html', 'svgicon', 'scss', 'webpack', 'img', 'copy'],
    'crticalcss',
    callback
  )
})

// Run the audit task to check the code
gulp.task('auditcode', callback => {
  runSequence(
    'scsslint',
    'jslint',
    callback
  )
})

// Run the audit task to check the built website for accessibility
// NOTE: Not used yet
/*
gulp.task('auditsite', callback => {
  runSequence(
    'deploy',
    callback
  )
})
*/

// Run the audit task to check performance using ...
// NOTE: Not used yet
/*
gulp.task('auditperf', callback => {
  runSequence(
    'deploy',
    callback
  )
})
*/
