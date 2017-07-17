// Common modules
import './common'

// Page modules
const socialShare = require('./social-share')
const templating = require('./template-render')
const browser = require('./browser')
const locationSelector = require('./location/locationSelector')

import { suffixer } from './location/suffixer'
import { getData } from './models/find-help/categories'

browser.loading()
// Get API data using promise

let currentLocation = null

locationSelector
  .getCurrent()
  .then((result) => {
    currentLocation = result

    const callback = function () {
      suffixer(currentLocation)
      browser.loaded()
      socialShare.init()
    }

    templating.renderTemplate('js-category-list-tpl', getData(currentLocation), 'js-category-list-output', callback)
  }, (_) => {

  })
