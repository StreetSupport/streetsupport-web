// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var socialShare = require('./social-share')

// Lodash
var forEach = require('lodash/collection/forEach')
var sortByOrder = require('lodash/collection/sortByOrder')

nav.init()
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
    forEach(result, function (category) {
      if (category.key === 'meals') {
        category.page = 'category-by-day'
      } else {
        category.page = 'category'
      }
    })

    var sorted = sortByOrder(result, ['sortOrder'], ['desc'])

    // Append object name for Hogan
    var theData = { categories: sorted }

    // Compile and render template
    var theTemplate = document.getElementById('js-category-list-tpl').innerHTML
    var compile = Hogan.compile(theTemplate)
    var theOutput = compile.render(theData)

    document.getElementById('js-category-list-output').innerHTML = theOutput

    loading.stop()
    socialShare.init()
  })
})
