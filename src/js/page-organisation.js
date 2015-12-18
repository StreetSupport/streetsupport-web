// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var urlParameter = require('./get-url-parameter')
var accordion = require('./accordion')
var socialShare = require('./social-share')
var sortBy = require('lodash/collection/sortBy')

nav.init()
FastClick.attach(document.body)

// Load and process data
require.ensure(['./api', './get-api-data', './template-render', 'spin.js', './analytics'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var Spinner = require('spin.js')
  var analytics = require('./analytics')
  var templating = require('./template-render')

  // Spinner
  var spin = document.getElementById('spin')
  var loading = new Spinner().spin(spin)

  var theOrganisation = urlParameter.parameter('organisation')
  var organisationUrl = apiRoutes.organisation += theOrganisation

  // Get API data using promise
  getApiData.data(organisationUrl).then(function (result) {
    // Get organisation name and edit page title
    var theTitle = result.name + ' - Street Support'
    document.title = theTitle

    result.providedServices = sortBy(result.providedServices, function (item) {
      return item.name
    })

    // Append object name for Hogan
    var theData = { organisation: result }

    var callback = function () {
      accordion.init()
      loading.stop()
      analytics.init(theTitle)
      socialShare.init()
    }

    templating.renderTemplate('js-organisation-tpl', theData, 'js-organisation-output', callback)
  })
})
