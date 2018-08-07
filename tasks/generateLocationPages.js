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
      .sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
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
      fs.writeFileSync(dest, newContent)
    })
  callback()
})

gulp.task('l-generate-nav-variables', () => {
  const srcFile = `${config.paths.scss}/modules/`
  const cityOutput = cities
    .map((c) => `${c.id}`)
    .join(' ')

  return newFile('_generated-location-nav-variables.scss', `$generated-locations-for-nav: ${cityOutput}`)
    .pipe(gulp.dest(srcFile))
})

gulp.task('l-generate-header-css', () => {
  const srcFile = `${config.paths.scss}/partials/`
  const cityOutput = cities
    .map((c) => `
    .location--${c.id} .location-header {
      @include mq($from: m) {
        &:before {
          background-image: url('../img/locations/${c.id}.png');
        }
      }
    }`)
    .join('\r\n')

  return newFile('_generated-location-header.scss', cityOutput)
    .pipe(gulp.dest(srcFile))
})

gulp.task('l-generate-desktop-nav', () => {
  const srcFile = `${config.paths.partials}/nav/`
  const cityOutput = cities
    .map((c) => `<ul class="nav__list nav__list--hub" data-city="${c.id}">
    {{> ${c.id}/nav }}
  </ul>`)
    .join(' ')

  return newFile('desktop-locations.hbs', cityOutput)
    .pipe(gulp.dest(srcFile))
})

gulp.task('l-generate-mobile-nav', () => {
  const srcFile = `${config.paths.partials}/nav/`
  const cityOutput = cities
    .map((c) => `{{> ${c.id}/nav }}`)
    .join(`
`)

  return newFile('mobile-locations.hbs', cityOutput)
    .pipe(gulp.dest(srcFile))
})

gulp.task('l-generate-header-nav', () => {
  const srcFile = `${config.paths.partials}/nav/`
  const cityOutput = cities
    .map((c) => `<li class="nav__item nav__item--sub-item nav__item--${c.id}" data-location="${c.id}"><a href="/${c.id}">${c.name}</a></li>`)
    .join(`
`)

  return newFile('header-locations.hbs', cityOutput)
    .pipe(gulp.dest(srcFile))
})


gulp.task('generate-location-files', (callback) => {
  runSequence(
    'l-clean',
    'l-getCities',
    'l-generate-home-pages',
    'l-generate-header-css',
    'l-generate-nav-variables',
    'l-generate-desktop-nav',
    'l-generate-mobile-nav',
    'l-generate-header-nav',
    callback
  )
})
