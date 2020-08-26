import del from 'del'
import fs from 'fs'
import gulp from 'gulp'
import request from 'request'
import runSequence from 'run-sequence'
import marked from 'marked'

import config from '../foley.json'
import endpoints from '../src/js/api'

const findHelpSrc = `${config.paths.pages}find-help/group/`
const categoryPageSrc = `${findHelpSrc}by-client-group/index.hbs`
const timetabledPageSrc = `${findHelpSrc}by-client-group/timetable/index.hbs`
const locationPageSrc = `${findHelpSrc}by-client-group/map/index.hbs`
const generatedPagesSrc = `${config.paths.pages}_generated/`

let clientGroups = []
let cities = []

gulp.task('getClientGroups', (callback) => {
  // const getPageUrl = (key) => {
  //   switch (key) {
  //     case 'meals': return 'meals/timetable'
  //     case 'dropin': return 'dropin/timetable'
  //     case 'accom': return 'accommodation'
  //     default: return key
  //   }
  // }

  request(endpoints.clientGroups, function (err, res, body) {
    clientGroups = JSON.parse(body)
      .sort((a, b) => {
        if (a.sortPosition < b.sortPosition) return 1
        if (a.sortPosition > b.sortPosition) return -1
        return 0
      })
      .map((c) => {
        return {
          key: c.key,
          name: c.name,
          page: c.key
          // page: getPageUrl(c.key)
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

const getNewTitle = function (catName, suffix = '') {
  const services = 'Client Group'
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
    .replace('theClientGroupId', cat.key)

    result = result.split('theClientGroupName').join(cat.name)
  return result
}

const getNewTimeTabledContent = function (src, cat) {
  let result = src
    .replace('page:', `page: find-help-${cat.key}`)
    .replace('title:', `title: ${getNewTitle(cat.name, 'Timetable')}`)
    .replace('description:', `description: Timetable of ${cat.name} Services available near your location`)
    .replace('theClientGroupId', cat.key)

    result = result.split('theClientGroupName').join(cat.name)
  return result
}

const getNewLocationContent = function (src, cat) {
  let result = src
    .replace('page:', `page: find-help-${cat.key}`)
    .replace('title:', `title: ${getNewTitle(cat.name, 'by Location')}`)
    .replace('description:', `description: ${cat.name} Services by location available near you`)
    .replace('theClientGroupId', cat.key)

  result = result.split('theClientGroupName').join(cat.name)
  return result
}

gulp.task('reset', () => {
  const generatedCategoryDirectories = clientGroups
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
  clientGroups
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}`
      fs.mkdirSync(destDir)
      fs.mkdirSync(`${destDir}/map`)
      fs.mkdirSync(`${destDir}/timetable`)
    })
})

gulp.task('generate-provider-listing-pages', () => {
  const srcContent = fs.readFileSync(categoryPageSrc, 'utf-8')

  clientGroups
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}/`
      const newContent = getNewContent(srcContent, c)
      fs.writeFileSync(`${destDir}index.hbs`, newContent)
    })
})

gulp.task('generate-timetabled-pages', () => {
  const srcContent = fs.readFileSync(timetabledPageSrc, 'utf-8')

  clientGroups
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}/`
      const newContent = getNewTimeTabledContent(srcContent, c)
      fs.writeFileSync(`${destDir}timetable/index.hbs`, newContent)
    })
})

gulp.task('generate-map-pages', () => {
  const srcContent = fs.readFileSync(locationPageSrc, 'utf-8')

  clientGroups
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}/${c.key}/`
      const newContent = getNewLocationContent(srcContent, c)
      fs.writeFileSync(`${destDir}map/index.hbs`, newContent)
    })
})

gulp.task('copy-to-find-help', () => {
  return gulp.src(generatedPagesSrc + '**/*', {})
    .pipe(gulp.dest(findHelpSrc))
})

gulp.task('generate-client-group-pages', (callback) => {
  runSequence(
    'reset',
    'getClientGroups',
    'getCities',
    'make-generated-files-directory',
    'generate-provider-directories',
    ['generate-provider-listing-pages', 'generate-timetabled-pages', 'generate-map-pages'],
    'copy-to-find-help',
    'clean-generated-files',
    callback
  )
})
