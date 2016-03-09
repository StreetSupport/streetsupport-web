// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var socialShare = require('./social-share')
var analytics = require('./analytics')

nav.init()
analytics.init()
FastClick.attach(document.body)

// Load and process data
require.ensure(['./api', './get-api-data', './template-render', 'spin.js', 'lodash'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var templating = require('./template-render')
  var Spinner = require('spin.js')
  var _ = require('lodash')

  // Spinner
  var spin = document.getElementById('spin')
  var loading = new Spinner().spin(spin)

  // Get API data using promise
  getApiData.data(apiRoutes.needs)
    .then(function (result) {
      var needsFromApi = result.data
      _.each(needsFromApi, function(need) {
        need.link = 'give-item-submit-details.html?providerId=' + need.serviceProviderId + '&needId=' + need.id
      })
      var theData = { 'needs': needsFromApi }
      var callback = function () {
        loading.stop()
        socialShare.init()
      }

      templating.renderTemplate('js-need-list-tpl', theData, 'js-need-list-output', callback)
    })
})
