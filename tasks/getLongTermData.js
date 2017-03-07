import config from '../foley.json'
import gulp from 'gulp'

import jeditor from 'gulp-json-editor'
import request from 'request'
import source from 'vinyl-source-stream'
import streamify from 'gulp-streamify'
import replace from 'gulp-replace'

const endpoints = require('../src/js/api')

/* calls API and generates static data */
gulp.task('service-categories', (callback) => {
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

gulp.task('supported-cities', (callback) => {
  return request(endpoints.cities)
    .pipe(source(`${config.paths.generatedData}supported-cities.js`))
    .pipe(streamify(jeditor(function (cities) {
      return cities.map(function (c) {
        return {
          id: c.id,
          name: c.name,
          latitude: c.latitude,
          longitude: c.longitude,
          isOpenToRegistrations: c.isOpenToRegistrations,
          isPublic: c.isPublic
        }
      })
    })))
    .pipe(replace('[', 'export const cities = ['))
    .pipe(gulp.dest('./'))
})

gulp.task('getLongTermData', ['service-categories', 'supported-cities'])
