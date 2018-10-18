import del from 'del'
import fs from 'fs'
import gulp from 'gulp'
import request from 'request'
import runSequence from 'run-sequence'

import config from '../foley.json'
import endpoints from '../src/js/api'
import { newFile } from './fileHelpers'

const findHelpSrc = `${config.paths.pages}find-help/`
const categoryPageSrc = `${findHelpSrc}category/index.hbs`
const timetabledPageSrc = `${findHelpSrc}category-by-day/index.hbs`
const locationPageSrc = `${findHelpSrc}category-by-location/index.hbs`
const generatedPagesSrc = `${config.paths.pages}_generated/`

let categories = []
let cities = []

gulp.task('getServiceCategories', (callback) => {
  request(endpoints.serviceCategories, function (err, res, body) {
    categories = JSON.parse(body)
      .sort((a, b) => {
        if (a.sortOrder < b.sortOrder) return 1
        if (a.sortOrder > b.sortOrder) return -1
        return 0
      })
      .map((c) => {
        return {
          key: c.key,
          name: c.name
        }
      })
    callback()
  })
})

gulp.task('getCities', (callback) => {
  request(endpoints.cities, function (err, res, body) {
    cities = JSON.parse(body)
    callback()
  })
})

const getNewContent = function (src, cat) {
  const result = src
    .replace('page:', `page: find-help-${cat.key}`)
    .replace('title:', `title: ${cat.name} Services - Street Support`)
    .replace('description:', `description: A comprehensive listing of ${cat.name} Services available near your location`)
  return result
}

const getNewTimeTabledContent = function (src, cat) {
  const result = src
    .replace('page:', `page: find-help-${cat.key}`)
    .replace('title:', `title: ${cat.name} Services Timetable - Street Support`)
    .replace('description:', `description: Timetable of ${cat.name} Services available near your location`)
  return result
}

const getNewLocationContent = function (src, cat) {
  const result = src
    .replace('page:', `page: find-help-${cat.key}`)
    .replace('title:', `title: ${cat.name} Services by Location - Street Support`)
    .replace('description:', `description: ${cat.name} Services by location available near you`)
  return result
}

gulp.task('reset', () => {
  const generatedCategoryDirectories = categories
    .map((c) => `${findHelpSrc}/${c.key}`)
  return del([...generatedCategoryDirectories, generatedPagesSrc])
})

gulp.task('clean-generated-files', () => {
  return del([generatedPagesSrc])
})

gulp.task('make-generated-files-directory', () => {
  fs.mkdirSync(generatedPagesSrc)
})

gulp.task('generate-provider-directories', () => {
  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}`
      fs.mkdirSync(destDir)
      fs.mkdirSync(`${destDir}/map`)
      fs.mkdirSync(`${destDir}/timetable`)
    })
})

gulp.task('generate-provider-listing-pages', () => {
  const srcContent = fs.readFileSync(categoryPageSrc, 'utf-8')

  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}/`
      const newContent = getNewContent(srcContent, c)
      fs.writeFileSync(`${destDir}index.hbs`, newContent)
    })
})

gulp.task('generate-timetabled-pages', () => {
  const srcContent = fs.readFileSync(timetabledPageSrc, 'utf-8')

  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}/`
      const newContent = getNewTimeTabledContent(srcContent, c)
      fs.writeFileSync(`${destDir}timetable/index.hbs`, newContent)
    })
})

gulp.task('generate-map-pages', () => {
  const srcContent = fs.readFileSync(locationPageSrc, 'utf-8')

  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}/${c.key}/`
      const newContent = getNewLocationContent(srcContent, c)
      fs.writeFileSync(`${destDir}map/index.hbs`, newContent)
    })
})

gulp.task('generate-nav-links', () => {
  const srcFile = `${config.paths.partials}/nav/`
  const output = categories
    .map((c) => {
      switch (c.key) {
        case 'accom':
          return `<li class="nav__item nav__item--sub-item nav__item--find-help-${c.key}"><a href="/find-help/accommodation/">${c.name}</a></li>`
        case 'meals':
        case 'dropin':
        case 'foodbank':
          return `<li class="nav__item nav__item--sub-item nav__item--find-help-${c.key}"><a href="/find-help/${c.key}/timetable/">${c.name}</a></li>`
        default:
          return `<li class="nav__item nav__item--sub-item nav__item--find-help-${c.key}"><a href="/find-help/${c.key}/">${c.name}</a></li>`
      }
    })
    .join('')

  return newFile('service-cats.hbs', output)
    .pipe(gulp.dest(srcFile))
})

gulp.task('generate-nav-variables', () => {
  const srcFile = `${config.paths.scss}/modules/`
  const catOutput = categories
    .map((c) => `find-help-${c.key}`)
    .join(' ')

  const cityOutput = cities
    .map((c) => `${c.id}-advice`)
    .join(' ')

  return newFile('_generated-variables.scss', `$generated-nav-pages: ${catOutput} ${cityOutput}`)
    .pipe(gulp.dest(srcFile))
})

gulp.task('copy-to-find-help', () => {
  return gulp.src(generatedPagesSrc + '**/*', {})
    .pipe(gulp.dest(findHelpSrc))
})

gulp.task('generate-service-pages', (callback) => {
  runSequence(
    'reset',
    'getServiceCategories',
    'getCities',
    'make-generated-files-directory',
    'generate-provider-directories',
    ['generate-provider-listing-pages', 'generate-timetabled-pages', 'generate-map-pages'],
    'copy-to-find-help',
    'clean-generated-files',
    'generate-nav-links',
    'generate-nav-variables',
    callback
  )
})
