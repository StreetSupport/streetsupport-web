import del from 'del'
import fs from 'fs'
import gulp from 'gulp'
import request from 'request'
import runSequence from 'gulp4-run-sequence'
import marked from 'marked'

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

gulp.task('getServiceCategories', gulp.series((callback) => {
  const getPageUrl = (key) => {
    switch (key) {
      case 'dropin': return 'dropin/timetable'
      case 'accom': return 'accommodation'
      default: return key
    }
  }

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
          name: c.name,
          synopsis: c.synopsis,
          page: getPageUrl(c.key)
        }
      })
    callback()
  })
}))

gulp.task('getCities', gulp.series((callback) => {
  request(endpoints.cities, function (err, res, body) {
    cities = JSON.parse(body)
    callback()
  })
}))

const getNewTitle = function (catName, suffix = '') {
  const services = 'Services'
  const parts = catName.includes(services)
    ? [
      catName.trim(),
      suffix,
      '- Street Support'
    ]
    : [
      catName.trim(),
      services,
      suffix,
      '- Street Support'
    ]
  return parts.join(' ')
}

const getNewContent = function (src, cat) {
  let result = src
    .replace('page:', `page: find-help-${cat.key}`)
    .replace('title:', `title: ${getNewTitle(cat.name)}`)
    .replace('description:', `description: A comprehensive listing of ${cat.name} Services available near your location`)
    .replace('theServiceCategoryId', cat.key)

    result = result.split('theServiceCategoryName').join(cat.name)
    result = result.split('theServiceCategorySynopsis').join(marked(cat.synopsis))
  return result
}

const getNewTimeTabledContent = function (src, cat) {
  let result = src
    .replace('page:', `page: find-help-${cat.key}`)
    .replace('title:', `title: ${getNewTitle(cat.name, 'Timetable')}`)
    .replace('description:', `description: Timetable of ${cat.name} Services available near your location`)
    .replace('theServiceCategoryId', cat.key)

    result = result.split('theServiceCategoryName').join(cat.name)
    result = result.split('theServiceCategorySynopsis').join(marked(cat.synopsis))
  return result
}

const getNewLocationContent = function (src, cat) {
  let result = src
    .replace('page:', `page: find-help-${cat.key}`)
    .replace('title:', `title: ${getNewTitle(cat.name, 'by Location')}`)
    .replace('description:', `description: ${cat.name} Services by location available near you`)
    .replace('theServiceCategoryId', cat.key)

  result = result.split('theServiceCategoryName').join(cat.name)
  result = result.split('theServiceCategorySynopsis').join(marked(cat.synopsis))
  return result
}

gulp.task('reset', gulp.series(() => {
  const generatedCategoryDirectories = categories
    .map((c) => `${findHelpSrc}/${c.key}`)
  return del([...generatedCategoryDirectories, generatedPagesSrc])
}))

gulp.task('clean-generated-files', gulp.series(() => {
  return del([generatedPagesSrc])
}))

gulp.task('make-generated-files-directory', gulp.series((callback) => {
  fs.mkdirSync(generatedPagesSrc)
  callback()
}))

gulp.task('generate-provider-directories', gulp.series((callback) => {
  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}`
      fs.mkdirSync(destDir)
      fs.mkdirSync(`${destDir}/map`)
      fs.mkdirSync(`${destDir}/timetable`)
    })
  callback()
}))

gulp.task('generate-provider-listing-pages', gulp.series((callback) => {
  const srcContent = fs.readFileSync(categoryPageSrc, 'utf-8')

  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}/`
      const newContent = getNewContent(srcContent, c)
      fs.writeFileSync(`${destDir}index.hbs`, newContent)
    })
  callback()
}))

gulp.task('generate-timetabled-pages', gulp.series((callback) => {
  const srcContent = fs.readFileSync(timetabledPageSrc, 'utf-8')

  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}/`
      const newContent = getNewTimeTabledContent(srcContent, c)
      fs.writeFileSync(`${destDir}timetable/index.hbs`, newContent)
    })
  callback()
}))

gulp.task('generate-map-pages', gulp.series((callback) => {
  const srcContent = fs.readFileSync(locationPageSrc, 'utf-8')

  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}/${c.key}/`
      const newContent = getNewLocationContent(srcContent, c)
      fs.writeFileSync(`${destDir}map/index.hbs`, newContent)
    })
  callback()
}))

gulp.task('generate-category-ctas', gulp.series(() => {
  const categoryCtaTemplate = `<span class="cta">
    <a class="btn btn--brand-d" id="{{key}}" href="{{page}}">
      <span class="btn__icon">
        <svg class="svg-{{key}}-dims"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/assets/svgsprite.svg#{{key}}"></use></svg>
        <span class="btn__overlay"></span>
      </span>
      <span class="btn__text">{{name}}</span>
    </a>
  </span>`
  const output = categories
    .map((c) => {
      let current = categoryCtaTemplate
      current = current.split('\n').join('')
      current = current.split('{{key}}').join(c.key)
      current = current.split('{{name}}').join(c.name)
      current = current.split('{{page}}').join(c.page)
      return current
    })
    .join('')
  const srcFile = `${config.paths.partials}/find-help/`
  return newFile('_generated-service-cats-ctas.hbs', output)
    .pipe(gulp.dest(srcFile))
}))

gulp.task('generate-nav-links', gulp.series(() => {
  const srcFile = `${config.paths.partials}/nav/`
  const output = categories
    .map((c) => {
      switch (c.key) {
        case 'accom':
          return `<li class="nav__item nav__item--sub-item nav__item--find-help-${c.key}"><a href="/find-help/accommodation/">${c.name}</a></li>`
        case 'dropin':
          return `<li class="nav__item nav__item--sub-item nav__item--find-help-${c.key}"><a href="/find-help/${c.key}/timetable/">${c.name}</a></li>`
        default:
          return `<li class="nav__item nav__item--sub-item nav__item--find-help-${c.key}"><a href="/find-help/${c.key}/">${c.name}</a></li>`
      }
    })
    .join('\n')

  return newFile('service-cats.hbs', output)
    .pipe(gulp.dest(srcFile))
}))

gulp.task('generate-nav-variables', gulp.series(() => {
  const srcFile = `${config.paths.scss}/modules/`
  const catOutput = categories
    .map((c) => `find-help-${c.key}`)
    .join(' ')

  const cityOutput = cities
    .map((c) => `${c.id}-advice`)
    .join(' ')

  return newFile('_generated-variables.scss', `$generated-nav-pages: ${catOutput} ${cityOutput}`)
    .pipe(gulp.dest(srcFile))
}))

gulp.task('copy-to-find-help', gulp.series(() => {
  return gulp.src(generatedPagesSrc + '**/*', {})
    .pipe(gulp.dest(findHelpSrc))
}))

gulp.task('generate-service-pages', gulp.series((callback) => {
  runSequence(
    'reset',
    'getServiceCategories',
    'getCities',
    'make-generated-files-directory',
    'generate-provider-directories',
    ['generate-provider-listing-pages', 'generate-timetabled-pages', 'generate-map-pages'],
    'copy-to-find-help',
    'clean-generated-files',
    'generate-category-ctas',
    'generate-nav-links',
    'generate-nav-variables',
    callback
  )
}))
