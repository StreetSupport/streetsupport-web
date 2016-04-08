// Common modules
import './common'

// Page modules
var apiRoutes = require('./api')
var getApiData = require('./get-api-data')
var templating = require('./template-render')
var Spinner = require('spin.js')
var forEach = require('lodash/collection/forEach')
var socialShare = require('./social-share')

// Spinner
var spin = document.getElementById('spin')
var loading = new Spinner().spin(spin)

// Get API data using promise
getApiData.data(apiRoutes.needs)
  .then(function (result) {
    var needsFromApi = result.data
    forEach(needsFromApi, function(need) {
      need.link = 'give-item-submit-details.html?id=' + need.id
    })
    var theData = { 'needs': needsFromApi }
    var callback = function () {
      loading.stop()
      socialShare.init()
    }

    templating.renderTemplate('js-need-list-tpl', theData, 'js-need-list-output', callback)
  })
