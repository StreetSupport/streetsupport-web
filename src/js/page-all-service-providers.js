// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js') // eslint-disable-line

// FastClick
FastClick.attach(document.body)

var _ = require('lodash')

require.ensure(['hogan.js'], function(require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var Hogan = require('hogan.js')

  // Get API data using promise
  getApiData.data(apiRoutes.serviceProviders).then(function (result) {
    var sorted = _.sortBy(result, function(provider) {
      return provider.name
    })

    // Append object name for Hogan
    var theData = { organisations : sorted }

    // Compile and render category template
    var theCategoryTemplate = document.getElementById('js-category-result-tpl').innerHTML
    var compileCategory = Hogan.compile(theCategoryTemplate)
    var theCategoryOutput = compileCategory.render(theData)

    document.getElementById('js-category-result-output').innerHTML=theCategoryOutput
  })
})
