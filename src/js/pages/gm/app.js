
/* global alert */

// Common modules
import '../../common'

const browser = require('../../browser')
const location = require('../../location/locationSelector')
const templating = require('../../template-render')
const wp = require('../../wordpress')

const initForms = function (currentLocation) {
  const findHelp = {
    form: document.querySelector('.js-find-help-form'),
    postcode: document.querySelector('.js-find-help-postcode')
  }

  findHelp.postcode.value = currentLocation.postcode
  findHelp.form.addEventListener('submit', function (e) {
    e.preventDefault()
    const reqLocation = findHelp.postcode.value
    location.setPostcode(reqLocation, () => {
      browser.redirect('/find-help/')
    }, () => alert('We could not find your postcode, please try a nearby one'))
  })

  const giveHelp = {
    form: document.querySelector('.js-give-help-form'),
    postcode: document.querySelector('.js-give-help-postcode')
  }

  giveHelp.postcode.value = currentLocation.postcode
  giveHelp.form.addEventListener('submit', function (e) {
    e.preventDefault()
    const reqLocation = giveHelp.postcode.value
    location.setPostcode(reqLocation, () => {
      browser.redirect('/give-help/help')
    }, () => alert('We could not find your postcode, please try a nearby one'))
  })
}

const initNews = function () {
  const totalPostsToShow = 3
  wp
    .getPostsByTag('greater-manchester', totalPostsToShow, 0, true)
    .then((result) => {
      if (result.posts.length === totalPostsToShow) {
        result.taxonomy.name = 'Greater Manchester'
        result.taxonomy.link = 'https://news.streetsupport.net/tag/greater-manchester/'
        templating.renderTemplate('js-news-tpl', result, 'js-news-output')
      }
    })
}

initNews()

location
  .getPreviouslySetPostcode()
  .then((result) => {
    initForms(result)
  })
