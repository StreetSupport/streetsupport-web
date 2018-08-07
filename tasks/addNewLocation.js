// usage: gulp add-new-location --locationId bury --locationName Bury

import { argv } from 'yargs'
import config from '../foley.json'
import fs from 'fs'
import gulp from 'gulp'
import runSequence from 'run-sequence'

const locationId = argv.locationId
const locationName = argv.locationName

const advicePageDir = `${config.paths.pages}${locationId}/advice`
const swepPageDir = `${config.paths.pages}${locationId}/severe-weather-accommodation`
const partialsDir = `${config.paths.partials}${locationId}`

gulp.task('anl-create-dirs', () => {
  if (locationId === undefined || locationId.length === 0) throw 'Please provide the id of the new location'
  if (locationName === undefined || locationName.length === 0) throw 'Please provide the name of the new location'
  
  fs.mkdirSync(`${config.paths.pages}${locationId}`)
  fs.mkdirSync(`${advicePageDir}`)
  fs.mkdirSync(`${swepPageDir}`)
  fs.mkdirSync(`${partialsDir}`)
})

gulp.task('anl-create-advice-page', () => {
  const srcContent = fs.readFileSync(`${config.paths.pages}locations/_advice.hbs`, 'utf-8')
  const newContent = srcContent
    .replace(new RegExp('locationId', 'g'), locationId)
    .replace(new RegExp('locationName', 'g'), locationName)
  const dest = `${advicePageDir}/index.hbs`
  fs.writeFileSync(dest, newContent)
})

gulp.task('anl-create-swep-page', () => {
  const srcContent = fs.readFileSync(`${config.paths.pages}locations/_swep.hbs`, 'utf-8')
  const newContent = srcContent
    .replace(new RegExp('locationId', 'g'), locationId)
    .replace(new RegExp('locationName', 'g'), locationName)
  const dest = `${swepPageDir}/index.hbs`
  fs.writeFileSync(dest, newContent)
})

gulp.task('anl-create-supporters-partial', () => {
  const srcContent = fs.readFileSync(`${config.paths.partials}/locations/_supporters.hbs`, 'utf-8')
  const newContent = srcContent
  const dest = `${partialsDir}/supporters.hbs`
  fs.writeFileSync(dest, newContent)
})

gulp.task('anl-create-nav-partial', () => {
  const srcContent = fs.readFileSync(`${config.paths.partials}/locations/_nav.hbs`, 'utf-8')
  const newContent = srcContent
    .replace(new RegExp('locationId', 'g'), locationId)
    .replace(new RegExp('locationName', 'g'), locationName)
  const dest = `${partialsDir}/nav.hbs`
  fs.writeFileSync(dest, newContent)
})

gulp.task('add-new-location', (callback) => {
  runSequence(
    'anl-create-dirs',
    'anl-create-advice-page',
    'anl-create-swep-page',
    'anl-create-supporters-partial',
    'anl-create-nav-partial',
    callback
  )
})
