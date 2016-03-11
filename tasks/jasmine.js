var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

gulp.task('run-jasmine', function () {
  return gulp.src('spec/**/*[sS]pec.js')
    // gulp-jasmine works on filepaths so you can't have any plugins before it
    .pipe(jasmine());
});
