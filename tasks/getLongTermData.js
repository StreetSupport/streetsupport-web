import config from '../foley.json'
import gulp from 'gulp'

import fs from 'fs'
import jeditor from 'gulp-json-editor'
import request from 'request'
import source from 'vinyl-source-stream'
import streamify from 'gulp-streamify'
import replace from 'gulp-replace'
import runSequence from 'gulp4-run-sequence'

const endpoints = require('../src/js/api')

import { newFile } from './fileHelpers'

require('../src/js/arrayExtensions')

/* calls API and generates static data */
gulp.task('volunteer-categories', gulp.series((callback) => {
  return request(endpoints.volunteerCategories)
    .pipe(source(`${config.paths.generatedData}full-volunteer-categories.js`))
    .pipe(gulp.dest('./'))
}))

gulp.task('parse-vol-categories', gulp.series((callback) => {
  const cats = JSON.parse(fs.readFileSync(`${config.paths.generatedData}full-volunteer-categories.js`))
    .items
    .map(function (c) {
      return {
        key: c.key,
        name: c.description
      }
    })
    .sortAsc('name')
  return newFile('volunteer-categories.js', `export const categories = ${JSON.stringify(cats)}`)
    .pipe(gulp.dest(`${config.paths.generatedData}`))
}))

gulp.task('need-categories', gulp.series((callback) => {
  return request(endpoints.needCategories)
    .pipe(source(`${config.paths.generatedData}need-categories.js`))
    .pipe(streamify(jeditor(function (data) {
      return data
        .sortAsc('value')
    })))
    .pipe(replace('[', 'export const categories = ['))
    .pipe(gulp.dest('./'))
}))

gulp.task('full-categories', gulp.series((callback) => {
  return request(endpoints.serviceCategories)
    .pipe(source(`${config.paths.generatedData}full-categories.js`))
    .pipe(gulp.dest('./'))
}))

gulp.task('main-categories', gulp.series((callback) => {
  const cats = JSON.parse(fs.readFileSync(`${config.paths.generatedData}full-categories.js`))
    .map(function (c) {
      return {
        key: c.key,
        synopsis: c.synopsis,
        sortOrder: c.sortOrder,
        name: c.name,
        subCategories: c.subCategories
      }
    })
    .sortDesc('sortOrder')
  return newFile('service-categories.js', `export const categories = ${JSON.stringify(cats)}`)
    .pipe(gulp.dest(`${config.paths.generatedData}`))
}))

gulp.task('accom-categories', gulp.series((callback) => {
  const cats = JSON.parse(fs.readFileSync(`${config.paths.generatedData}full-categories.js`))
    .find(c => c.key === 'accom')
    .subCategories
    .map(function (c) {
      return {
        key: c.key,
        name: c.name
      }
    })
    .sortAsc('name')
  return newFile('accom-categories.js', `export const categories = ${JSON.stringify(cats)}`)
    .pipe(gulp.dest(`${config.paths.generatedData}`))
}))

gulp.task('supported-cities', gulp.series((callback) => {
  return request(endpoints.cities)
    .pipe(source(`${config.paths.generatedData}supported-cities.js`))
    .pipe(streamify(jeditor((cities) => cities
      .sortAsc('name')
    )))
    .pipe(replace('[{', 'export const cities = [{'))
    .pipe(gulp.dest('./'))
}))

gulp.task('parse-categories', gulp.series((callback) => {
  runSequence(
    'full-categories',
    ['main-categories', 'accom-categories'],
    callback
  )
}))

gulp.task('parse-vol-categories-task', gulp.series((callback) => {
  runSequence(
    'volunteer-categories',
    'parse-vol-categories',
    callback
  )
}))

gulp.task('client-groups', gulp.series((callback) => {
  return request(endpoints.clientGroups)
    .pipe(source(`${config.paths.generatedData}client-groups.js`))
    .pipe(streamify(jeditor((clientGroups) => clientGroups.map(function (c) {
      return {
        key: c.key,
        name: c.name,
        sortPosition: c.sortPosition
      }
    }).sortDesc('sortPosition')
    )))
    .pipe(replace('[{', 'export const clientGroups = [{'))
    .pipe(gulp.dest('./'))
}))

gulp.task('getLongTermData',gulp.series((callback) => {
  runSequence(
[
  'parse-categories',
  'supported-cities',
  'need-categories',
  'parse-vol-categories-task',
  'client-groups'
], callback
)
}))
