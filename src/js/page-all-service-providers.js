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

require.ensure(['./api', './get-api-data', 'hogan.js', 'spin.js'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var Hogan = require('hogan.js')
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

    // Compile and render category template
    var theTemplate = document.getElementById('js-category-result-tpl').innerHTML
    var compileTemplate = Hogan.compile(theTemplate)
    var theOutput = compileTemplate.render(theData)

    document.getElementById('js-category-result-output').innerHTML = theOutput

    loading.stop()
    socialShare.init()
  })
})
