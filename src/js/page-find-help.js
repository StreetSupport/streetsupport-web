// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js') // eslint-disable-line

var forEach = require('lodash/collection/forEach')

// FastClick
FastClick.attach(document.body)

// Load and process data
require.ensure(['./api', './get-api-data', 'hogan.js', 'spin.js'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var Hogan = require('hogan.js')
  var Spinner = require('spin.js')

  // Spinner
  var spin = document.getElementById('spin')
  var loading = new Spinner().spin(spin)

  // Get API data using promise
  getApiData.data(apiRoutes.serviceCategories).then(function (result) {

    forEach(result, function(category) {
      if(category.key === "meals") {
        category.page = "category-by-day"
      }else {
        category.page = "category"
      }
    })

    // Append object name for Hogan
    var theData = { categories: result }

    // Compile and render template
    var theTemplate = document.getElementById('js-category-list-tpl').innerHTML
    var compile = Hogan.compile(theTemplate)
    var theOutput = compile.render(theData)

    document.getElementById('js-category-list-output').innerHTML = theOutput

    loading.stop()
  })
})
