// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var socialShare = require('./social-share')
var analytics = require('./analytics')

// Lodash
var sortBy = require('lodash/collection/sortBy')

nav.init()
analytics.init()
FastClick.attach(document.body)

require.ensure(['./api', './get-api-data', './template-render', 'spin.js'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var templating = require('./template-render')
  var Spinner = require('spin.js')

  // Spinner
  var spin = document.getElementById('spin')
  var loading = new Spinner().spin(spin)

  // Get API data using promise
  getApiData.data(apiRoutes.serviceProviders).then(function (result) {
    var sorted = sortBy(result.data, function (provider) {
      return provider.name.toLowerCase()
    })

    // Append object name for Hogan
    var theData = { organisations: sorted }

    var callback = function () {
      loading.stop()
      socialShare.init()
    }

    templating.renderTemplate('js-category-result-tpl', theData, 'js-category-result-output', callback)
  })
})
