// Common modules
import './common'
import 'babel-polyfill'

// Page modules
var socialShare = require('./social-share')
var templating = require('./template-render')
var browser = require('./browser')
let locationSelector = require('./location/locationSelector')
import { categories } from '../data/generated/service-categories'

browser.loading()
// Get API data using promise

let currentLocation = null

let getData = () => {
  categories
    .forEach((category) => {
      if (category.key === 'meals' || category.key === 'dropin') {
        category.page = 'category-by-day'
      } else {
        category.page = 'category'
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
    document.querySelector('.js-city-label')
      .innerHTML = 'in ' + currentLocation.name

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
