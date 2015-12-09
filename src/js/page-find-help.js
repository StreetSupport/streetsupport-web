// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js') // eslint-disable-line

// FastClick
FastClick.attach(document.body)

// Load and process data
require.ensure(['./api', './get-api-data', 'hogan.js'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var Hogan = require('hogan.js')

  // Get API data using promise
  getApiData.data(apiRoutes.serviceCategories).then(function (result) {
    // Append object name for Hogan
    var theData = { categories: result }

    // Compile and render template
    var theTemplate = document.getElementById('js-category-list-tpl').innerHTML
    var compile = Hogan.compile(theTemplate)
    var theOutput = compile.render(theData)

    document.getElementById('js-category-list-output').innerHTML = theOutput
  })
})
