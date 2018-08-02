import del from 'del'
import fs from 'fs'
import gulp from 'gulp'
import request from 'request'
import runSequence from 'run-sequence'

import config from '../foley.json'
import endpoints from '../src/js/api'
import { newFile } from './fileHelpers'

const pagesRoot = `${config.paths.pages}`
const homePageSrc = `${pagesRoot}locations/_home-page.hbs`

let cities = []

gulp.task('l-getCities', (callback) => {
  request(endpoints.cities, function (err, res, body) {
    cities = JSON.parse(body)
    callback()
  })
})

gulp.task('l-clean', () => {
  const generatedHomePages = cities
    .map((c) => `${pagesRoot}${c.id}/index.hbs`)
  return del(generatedHomePages)
})


gulp.task('l-generate-home-pages', (callback) => {
  const srcContent = fs.readFileSync(homePageSrc, 'utf-8')
  cities
    .forEach((c) => {
      const newContent = srcContent
        .replace(new RegExp('locationId', 'g'), c.id)
        .replace(new RegExp('locationName', 'g'), c.name)
      const dest = `${pagesRoot}${c.id}/index.hbs`   
      console.log(`writing new location home page to ${dest}`)     

      fs.writeFileSync(dest, newContent)
    })
  callback()
})


gulp.task('generate-location-home-pages', (callback) => {
  runSequence(
    'l-clean',
    'l-getCities',
    'l-generate-home-pages',
    callback
  )
})
