import config from '../foley.json'
import gulp from 'gulp'

import fs from 'fs'
import jeditor from 'gulp-json-editor'
import request from 'request'
import source from 'vinyl-source-stream'
import streamify from 'gulp-streamify'
import replace from 'gulp-replace'
import runSequence from 'run-sequence'

const endpoints = require('../src/js/api')

import { newFile } from './fileHelpers'

/* calls API and generates static data */
gulp.task('full-categories', (callback) => {
  return request(endpoints.serviceCategories)
    .pipe(source(`${config.paths.generatedData}full-categories.js`))
    .pipe(gulp.dest('./'))
})

gulp.task('main-categories', (callback) => {
  const cats = JSON.parse(fs.readFileSync(`${config.paths.generatedData}full-categories.js`))
    .map(function (c) {
      return {
        key: c.key,
        synopsis: c.synopsis,
        sortOrder: c.sortOrder,
        name: c.name
      }
    })
    .sort((a, b) => {
      if (a.sortOrder > b.sortOrder) return -1
      if (a.sortOrder < b.sortOrder) return 1
      return 0
    })
  return newFile('service-categories.js', `export const categories = ${JSON.stringify(cats)}`)
    .pipe(gulp.dest(`${config.paths.generatedData}`))
})

gulp.task('accom-categories', (callback) => {
  const cats = JSON.parse(fs.readFileSync(`${config.paths.generatedData}full-categories.js`))
    .find(c => c.key === 'accom')
    .subCategories
    .map(function (c) {
      return {
        key: c.key,
        name: c.name
      }
    })
    .sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
  return newFile('accom-categories.js', `export const categories = ${JSON.stringify(cats)}`)
    .pipe(gulp.dest(`${config.paths.generatedData}`))
})

gulp.task('supported-cities', (callback) => {
  return request(endpoints.cities)
    .pipe(source(`${config.paths.generatedData}supported-cities.js`))
    .pipe(streamify(jeditor((cities) => cities
      .sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
    )))
    .pipe(replace('[{', 'export const cities = [{'))
    .pipe(gulp.dest('./'))
})

gulp.task('parse-categories', (callback) => {
  runSequence(
    'full-categories',
    ['main-categories', 'accom-categories'],
    callback
  )
})

gulp.task('getLongTermData', ['parse-categories', 'supported-cities'])
