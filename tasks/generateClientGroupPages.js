import del from 'del'
import fs from 'fs'
import gulp from 'gulp'
import request from 'request'
import runSequence from 'gulp4-run-sequence'

import config from '../foley.json'
import endpoints from '../src/js/api'

const findHelpSrc = `${config.paths.pages}find-help/group/`
const categoryPageSrc = `${config.paths.pages}find-help/group/index.hbs`
const timetabledPageSrc = `${config.paths.pages}find-help/group/by-day/index.hbs`
const locationPageSrc = `${config.paths.pages}find-help/group/by-location/index.hbs`
const generatedPagesSrc = `${config.paths.pages}_generated/`

let clientGroups = []
let cities = []

gulp.task('getClientGroups', gulp.series((callback) => {
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
        }
      })
    callback()
  })
}))

gulp.task('getCitiesCG', gulp.series((callback) => {
  request(endpoints.cities, function (err, res, body) {
    cities = JSON.parse(body)
    callback()
  })
}))

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

gulp.task('resetCG', gulp.series(() => {
  const generatedClientGroupsDirectories = clientGroups
    .map((c) => `${findHelpSrc}${c.key}`)
  return del([...generatedClientGroupsDirectories, generatedPagesSrc])
}))

gulp.task('clean-generated-filesCG', gulp.series(() => {
  return del([generatedPagesSrc])
}))

gulp.task('make-generated-files-directoryCG', gulp.series((callback) => {
  fs.mkdirSync(generatedPagesSrc)
  callback()
}))

gulp.task('generate-provider-directoriesCG', gulp.series((callback) => {
  clientGroups
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}`
      fs.mkdirSync(destDir)
      fs.mkdirSync(`${destDir}/map`)
      fs.mkdirSync(`${destDir}/timetable`)
    })
  callback()
}))

gulp.task('generate-provider-listing-pagesCG', gulp.series((callback) => {
  const srcContent = fs.readFileSync(categoryPageSrc, 'utf-8')

  clientGroups
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}/`
      const newContent = getNewContent(srcContent, c)
      fs.writeFileSync(`${destDir}index.hbs`, newContent)
    })
  callback()
}))

gulp.task('generate-timetabled-pagesCG', gulp.series((callback) => {
  const srcContent = fs.readFileSync(timetabledPageSrc, 'utf-8')

  clientGroups
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}/`
      const newContent = getNewTimeTabledContent(srcContent, c)
      fs.writeFileSync(`${destDir}timetable/index.hbs`, newContent)
    })
  callback()
}))

gulp.task('generate-map-pagesCG', gulp.series((callback) => {
  const srcContent = fs.readFileSync(locationPageSrc, 'utf-8')

  clientGroups
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}/${c.key}/`
      const newContent = getNewLocationContent(srcContent, c)
      fs.writeFileSync(`${destDir}map/index.hbs`, newContent)
    })
  callback()
}))

gulp.task('copy-to-find-helpCG', gulp.series(() => {
  return gulp.src(generatedPagesSrc + '**/*', {})
    .pipe(gulp.dest(findHelpSrc))
}))

gulp.task('generate-find-help-client-group-pages', gulp.series((callback) => {
  runSequence(
    'resetCG',
    'getClientGroups',
    'getCitiesCG',
    'make-generated-files-directoryCG',
    'generate-provider-directoriesCG',
    ['generate-provider-listing-pagesCG', 'generate-timetabled-pagesCG', 'generate-map-pagesCG'],
    'copy-to-find-helpCG',
    'clean-generated-filesCG',
    callback
  )
}))
