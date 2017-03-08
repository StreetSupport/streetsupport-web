import del from 'del'
import fs from 'fs'
import gulp from 'gulp'
import runSequence from 'run-sequence'

import config from '../foley.json'
import { categories } from '../src/data/generated/service-categories'

const findHelpSrc = `${config.paths.pages}/find-help/`
const categoryPageSrc = `${findHelpSrc}/category/index.hbs`
const timetabledPageSrc = `${findHelpSrc}/category-by-day/index.hbs`
const locationPageSrc = `${findHelpSrc}/category-by-location/index.hbs`

const generatedPagesSrc = `${config.paths.pages}/_generated/`

const getNewContent = function (src, cat) {
  const result = src
    .replace('title:', `title: ${cat.name} Services - Street Support`)
    .replace('description:', `description: A comprehensive listing of ${cat.name} Services available near your location`)
  return result
}

const getNewTimeTabledContent = function (src, cat) {
  const result = src
    .replace('title:', `title: ${cat.name} Services Timetable - Street Support`)
    .replace('description:', `description: Timetable of ${cat.name} Services available near your location`)
  return result
}

const getNewLocationContent = function (src, cat) {
  const result = src
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
  fs.mkdir(generatedPagesSrc)
})

gulp.task('generate-provider-directories', () => {
  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}/${c.key}/`
      fs.mkdir(destDir)
      fs.mkdir(`${destDir}/map`)
      fs.mkdir(`${destDir}/timetable`)
    })
})

gulp.task('generate-provider-listing-pages', () => {
  const srcContent = fs.readFileSync(categoryPageSrc, 'utf-8')

  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}/${c.key}/`
      const newContent = getNewContent(srcContent, c)
      fs.writeFileSync(`${destDir}/index.hbs`, newContent)
    })
})

gulp.task('generate-timetabled-pages', () => {
  const srcContent = fs.readFileSync(timetabledPageSrc, 'utf-8')

  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}/${c.key}/`
      const newContent = getNewTimeTabledContent(srcContent, c)
      fs.writeFileSync(`${destDir}/timetable/index.hbs`, newContent)
    })
})

gulp.task('generate-map-pages', () => {
  const srcContent = fs.readFileSync(locationPageSrc, 'utf-8')

  categories
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}/${c.key}/`
      const newContent = getNewLocationContent(srcContent, c)
      fs.writeFileSync(`${destDir}/map/index.hbs`, newContent)
    })
})

gulp.task('copy-to-find-help', () => {
  return gulp.src(generatedPagesSrc + '**/*', {})
  .pipe(gulp.dest(findHelpSrc))
})

gulp.task('generate-service-pages', (callback) => {
  runSequence(
    'reset',
    'make-generated-files-directory',
    'generate-provider-directories',
    ['generate-provider-listing-pages', 'generate-timetabled-pages', 'generate-map-pages'],
    'copy-to-find-help',
    'clean-generated-files',
    callback
  )
})
