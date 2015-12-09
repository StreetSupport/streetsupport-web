// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js') // eslint-disable-line
var urlParameter = require('./get-url-parameter')

// FastClick
FastClick.attach(document.body)

// Load and process data
require.ensure(['./api', './get-api-data', 'hogan.js'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var Hogan = require('hogan.js')

  var theCategory = urlParameter.parameter('category')
  var categoryUrl = apiRoutes.subCategoryServiceProviders += theCategory

  // Get API data using promise
  getApiData.data(categoryUrl).then(function (result) {
    // Append object name for Hogan
    var theData = { organisations: result }

    // Compile and render template
    var theTemplate = document.getElementById('js-category-result-tpl').innerHTML
    var compileTemplate = Hogan.compile(theTemplate)
    var theOutput = compileTemplate.render(theData)

    document.getElementById('js-category-result-output').innerHTML = theOutput
  })
})
