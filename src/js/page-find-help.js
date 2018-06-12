// Common modules
import './common'

// Page modules
const templating = require('./template-render')
const browser = require('./browser')
const locationSelector = require('./location/locationSelector')

const getApiData = require('./get-api-data')
const apiRoutes = require('./api')

import { suffixer } from './location/suffixer'
import { getData } from './models/find-help/categories'

const render = (location, cities) => {
  const callback = function () {
    suffixer(location)
    browser.loaded()
  }
  templating.renderTemplate('js-category-list-tpl', getData(location, cities.data), 'js-category-list-output', callback)
}

browser.loading()

locationSelector
  .getCurrent()
  .then((location) => {
    getApiData
      .data(apiRoutes.cities)
      .then((cities) => {
        render(location, cities)
      })
  }, (_) => {
    browser.redirect('/500')
  })
