// Common modules
import './common'

// Lodash
var sortBy = require('lodash/collection/sortBy')
var forEach = require('lodash/collection/forEach')
var apiRoutes = require('./api')
var getApiData = require('./get-api-data')
var templating = require('./template-render')
var browser = require('./browser')

browser.loading()
// Get API data using promise
getApiData.data(apiRoutes.serviceProviders)
  .then(function (result) {
    var sorted = sortBy(result.data, function (provider) {
      return provider.name.toLowerCase()
    })

    forEach(sorted, function (sp) {
      sp.formattedTags = []
      forEach(sp.tags, function (tag) {
        sp.formattedTags.push({ id: tag, name: tag.replace(/-/g, ' ')})
      })
    })

    // Append object name for Hogan
    var theData = { organisations: sorted }

    var callback = function () {
      browser.loaded()
    }

    templating.renderTemplate('js-category-result-tpl', theData, 'js-category-result-output', callback)
  })
