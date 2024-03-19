// Load paths and gulp
import config from '../foley.json'
import gulp from 'gulp'

// Specific task modules
import fs from 'fs'

// HTML minify task
gulp.task('cachebusting', gulp.series((callback) => {
  fs.writeFile(config.paths.data + 'cachebusting.json', '{"date": "' + new Date().getTime() + '"}', callback);
}))
