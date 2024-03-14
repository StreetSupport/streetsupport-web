// usage: gulp add-new-location --locationId bury --locationName Bury

import { argv } from 'yargs'
import config from '../foley.json'
import fs from 'fs'
import gulp from 'gulp'
import runSequence from 'gulp4-run-sequence'

const locationId = argv.locationId
const locationName = argv.locationName

const rootDir = `${config.paths.pages}${locationId}`
const advicePageDir = `${config.paths.pages}${locationId}/advice`
const swepPageDir = `${config.paths.pages}${locationId}/severe-weather-accommodation`
const partialsDir = `${config.paths.partials}${locationId}`

gulp.task('anl-create-dirs', gulp.series((callback) => {
  if (locationId === undefined || locationId.length === 0) throw 'Please provide the id of the new location'
  if (locationName === undefined || locationName.length === 0) throw 'Please provide the name of the new location'

  fs.mkdirSync(`${rootDir}`)
  fs.mkdirSync(`${advicePageDir}`)
  fs.mkdirSync(`${swepPageDir}`)
  fs.mkdirSync(`${partialsDir}`)
  callback()
}))

gulp.task('anl-create-home-page', gulp.series((callback) => {
  const srcContent = fs.readFileSync(`${config.paths.pages}locations/_home-page.hbs`, 'utf-8')
  const newContent = srcContent
    .replace(new RegExp('locationId', 'g'), locationId)
    .replace(new RegExp('locationName', 'g'), locationName)
  const dest = `${rootDir}/index.hbs`
  fs.writeFileSync(dest, newContent, callback)
}))

gulp.task('anl-create-advice-page', gulp.series((callback) => {
  const srcContent = fs.readFileSync(`${config.paths.pages}locations/_advice2.hbs`, 'utf-8')
  const newContent = srcContent
    .replace(new RegExp('locationId', 'g'), locationId)
    .replace(new RegExp('locationName', 'g'), locationName)
  const dest = `${advicePageDir}/index.hbs`
  fs.writeFileSync(dest, newContent, callback)
}))

gulp.task('anl-create-swep-page', gulp.series((callback) => {
  const srcContent = fs.readFileSync(`${config.paths.pages}locations/_swep.hbs`, 'utf-8')
  const newContent = srcContent
    .replace(new RegExp('locationId', 'g'), locationId)
    .replace(new RegExp('locationName', 'g'), locationName)
  const dest = `${swepPageDir}/index.hbs`
  fs.writeFileSync(dest, newContent, callback)
}))

gulp.task('anl-create-supporters-partial', gulp.series((callback) => {
  const srcContent = fs.readFileSync(`${config.paths.partials}/locations/_supporters.hbs`, 'utf-8')
  const newContent = srcContent
  const dest = `${partialsDir}/supporters.hbs`
  fs.writeFileSync(dest, newContent, callback)
}))

gulp.task('anl-create-nav-partial', gulp.series((callback) => {
  const srcContent = fs.readFileSync(`${config.paths.partials}/locations/_nav.hbs`, 'utf-8')
  const newContent = srcContent
    .replace(new RegExp('locationId', 'g'), locationId)
    .replace(new RegExp('locationName', 'g'), locationName)
  const dest = `${partialsDir}/nav.hbs`
  fs.writeFileSync(dest, newContent, callback)
}))

gulp.task('add-new-location', gulp.series((callback) => {
  runSequence(
    'anl-create-dirs',
    'anl-create-home-page',
    'anl-create-advice-page',
    'anl-create-swep-page',
    'anl-create-supporters-partial',
    'anl-create-nav-partial',
    callback
  )
}))
