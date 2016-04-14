// Load global config and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import jasmine from 'gulp-jasmine'

gulp.task('jasmine', function () {
  return gulp.src(config.paths.spec + '**/*[sS]pec.js')
    // gulp-jasmine works on filepaths so you can't have any plugins before it
    .pipe(jasmine())
})
