import config from '../foley.json'
import casperJs from 'gulp-casperjs'
import gulp from 'gulp'
const http = require('http')
const connect = require('connect')
const serveStatic = require('serve-static')
import runSequence from 'run-sequence'

let server = null

gulp.task('start-server', (done) => {
  server = connect().use(serveStatic(config.paths.build))
  http.createServer(server).listen(9000, done)
})


gulp.task('casper-test', function () {
  gulp.src(config.paths.browserTests + '**/*')
    .pipe(casperJs()) // run casperjs test
})

gulp.task('casper', (callback) => {
  runSequence(
    'start-server',
    'casper-test',
    callback
  )
})
