// Common modules
import './common'

// Page modules
const socialShare = require('./social-share')
const templating = require('./template-render')
const browser = require('./browser')
const locationSelector = require('./location/locationSelector')

const getApiData = require('./get-api-data')
const apiRoutes = require('./api')

import { suffixer } from './location/suffixer'
import { getData } from './models/find-help/categories'

browser.loading()
// Get API data using promise

locationSelector
  .getCurrent()
  .then((location) => {
    getApiData
      .data(apiRoutes.cities)
      .then((cities) => {
        const callback = function () {
          suffixer(location)
          browser.loaded()
          socialShare.init()
        }
        templating.renderTemplate('js-category-list-tpl', getData(location, cities.data), 'js-category-list-output', callback)
      })
  }, (_) => {
    browser.redirect('/500')
  })
