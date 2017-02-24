import config from '../foley.json'
import gulp from 'gulp'

import jeditor from 'gulp-json-editor'
import request from 'request'
import source from 'vinyl-source-stream'
import streamify from 'gulp-streamify'
import replace from 'gulp-replace'

const endpoints = require('../src/js/api')

/* calls API and generates static data */
gulp.task('getLongTermData', (callback) => {
  return request(endpoints.serviceCategories)
    .pipe(source(`${config.paths.generatedData}service-categories.js`))
    .pipe(streamify(jeditor(function (cats) {
      return cats.map(function (c) {
        return {
          key: c.key,
          sortOrder: c.sortOrder,
          name: c.name
        }
      })
    })))
    .pipe(replace('[', 'export const categories = ['))
    .pipe(gulp.dest('./'))
})
