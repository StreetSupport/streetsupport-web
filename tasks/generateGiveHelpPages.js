import del from 'del'
import fs from 'fs'
import gulp from 'gulp'
import request from 'request'
import runSequence from 'run-sequence'

import config from '../foley.json'
import endpoints from '../src/js/api'

const giveHelpSrc = `${config.paths.pages}give-help/help/group/`
const giveHelpPageSrc = `${config.paths.pages}give-help/help/group/index.hbs`
const generatedPagesSrc = `${config.paths.pages}_generated/`

let clientGroups = []

gulp.task('getGiveHelpClientGroups', (callback) => {
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
})

const getNewContent = function (src, cat) {
  let result = src.split('theClientGroupName').join(cat.name)
  return result
}

gulp.task('resetGiveHelpCG', () => {
  const generatedClientGroupsDirectories = clientGroups
    .map((c) => `${giveHelpSrc}${c.key}`)
  return del([...generatedClientGroupsDirectories, generatedPagesSrc])
})

gulp.task('clean-generated-files-give-help-CG', () => {
  return del([generatedPagesSrc])
})

gulp.task('make-generated-files-directoryCG', () => {
  fs.mkdirSync(generatedPagesSrc)
})

gulp.task('generate-needs-directoriesCG', () => {
  clientGroups
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}`
      fs.mkdirSync(destDir)
    })
})

gulp.task('generate-needs-listing-pagesCG', () => {
  const srcContent = fs.readFileSync(giveHelpPageSrc, 'utf-8')

  clientGroups
    .forEach((c) => {
      const destDir = `${generatedPagesSrc}${c.key}/`
      const newContent = getNewContent(srcContent, c)
      fs.writeFileSync(`${destDir}index.hbs`, newContent)
    })
})

gulp.task('copy-to-give-helpCG', () => {
  return gulp.src(generatedPagesSrc + '**/*', {})
    .pipe(gulp.dest(giveHelpSrc))
})

gulp.task('generate-give-help-client-group-pages', (callback) => {
  runSequence(
    'resetGiveHelpCG',
    'getGiveHelpClientGroups',
    'make-generated-files-directoryCG',
    'generate-needs-directoriesCG',
    'generate-needs-listing-pagesCG',
    'copy-to-give-helpCG',
    'clean-generated-files-give-help-CG',
    callback
  )
})
