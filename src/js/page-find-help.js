// Common modules
import './common'

// Page modules
var socialShare = require('./social-share')
var forEach = require('lodash/collection/forEach')
var sortByOrder = require('lodash/collection/sortByOrder')
var apiRoutes = require('./api')
var getApiData = require('./get-api-data')
var templating = require('./template-render')
var Spinner = require('spin.js')

// Spinner
var spin = document.getElementById('spin')
var loading = new Spinner().spin(spin)

// Get API data using promise
getApiData
  .data(apiRoutes.serviceCategories)
  .then(function (result) {
    var data = result.data
    forEach(data, function (category) {
      if (category.key === 'meals' || category.key === 'dropin') {
        category.page = 'category-by-day'
      } else {
        category.page = 'category'
      }
    })

    var sorted = sortByOrder(data, ['sortOrder'], ['desc'])

    // Append object name for Hogan
    var theData = { categories: sorted }

    var callback = function () {
      loading.stop()
      socialShare.init()
    }

    templating.renderTemplate('js-category-list-tpl', theData, 'js-category-list-output', callback)
  })
