/**
* @file testing.js - Testing related Gulp tasks
* @author Daniel Furze <daniel@furzeface.com>
* @see {@link https://github.com/garris/BackstopJS}
*/

// Load global gulp
import gulp from 'gulp'

// Specific task modules
const exec = require('child_process').exec

// Generate a base config file (only run once)
gulp.task('genConfig', () => {
  exec('cd node_modules/backstopjs && gulp genConfig', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout)

    if (error !== null) {
      console.log('exec error: ' + error)
    }
  })
})

// Refreshes the config file after changes
gulp.task('bless', () => {
  exec('cd node_modules/backstopjs && gulp bless', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout)

    if (error !== null) {
      console.log('exec error: ' + error)
    }
  })
})

// Creates new reference screenshots for tests
gulp.task('reference', () => {
  exec('cd node_modules/backstopjs && gulp reference', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout)

    process.exit()

    if (error !== null) {
      console.log('exec error: ' + error)
    }
  })
})

// Runs the tests
gulp.task('visualTesting', () => {
  exec('cd node_modules/backstopjs && gulp test', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout)

    process.exit()

    if (error !== null) {
      console.log('exec error: ' + error)
    }
  })
})

// Opens the visual report at http://localhost:3001/compare
gulp.task('openReport', () => {
  exec('cd node_modules/backstopjs && npm run openReport', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout)

    if (error !== null) {
      console.log('exec error: ' + error)
    }
  })
})
