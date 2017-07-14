// Common modules
import './common'

// Page modules
const socialShare = require('./social-share')
const templating = require('./template-render')
const browser = require('./browser')
const locationSelector = require('./location/locationSelector')

import { suffixer } from './location/suffixer'
import { categories } from '../data/generated/service-categories'

browser.loading()
// Get API data using promise

let currentLocation = null

let getData = () => {
  categories
    .forEach((category) => {
      if (category.key === 'meals' || category.key === 'dropin') {
        category.page = `${category.key}/timetable`
      } if (category.key === 'accom') {
        category.page = 'accommodation'
      } else {
        category.page = `${category.key}`
      }
    })

  // Append object name for Hogan
  var theData = {
    categories: categories,
    location: currentLocation,
    emergencyHelpUrl: currentLocation.id === 'elsewhere'
      ? '/find-help/emergency-help/'
      : `/${currentLocation.id}/emergency-help/`
  }

  var callback = function () {
    suffixer(currentLocation)
    browser.loaded()
    socialShare.init()
  }

  templating.renderTemplate('js-category-list-tpl', theData, 'js-category-list-output', callback)
}

locationSelector
  .getCurrent()
  .then((result) => {
    currentLocation = result
    getData()
  }, (_) => {

  })
