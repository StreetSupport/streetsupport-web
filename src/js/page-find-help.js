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
      } else {
        category.page = `${category.key}`
      }
    })
  var sorted = categories
    .sort((a, b) => {
      if (a.sortOrder < b.sortOrder) return -1
      if (a.sortOrder > b.sortOrder) return 1
      return 0
    })

  // Append object name for Hogan
  var theData = {
    categories: sorted,
    location: currentLocation
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
