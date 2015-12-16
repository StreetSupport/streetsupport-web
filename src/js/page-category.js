// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var urlParameter = require('./get-url-parameter')
var accordion = require('./accordion')
var socialShare = require('./social-share')

nav.init()
FastClick.attach(document.body)

// Load and process data
require.ensure(['./api', './get-api-data', './get-location', 'hogan.js', 'spin.js'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var Hogan = require('hogan.js')
  var getLocation = require('./get-location')
  var Spinner = require('spin.js')

  // Spinner
  var spin = document.getElementById('spin')
  var loading = new Spinner().spin(spin)

  // Get category and create URL
  var theCategory = urlParameter.parameter('category')
  var categoryUrl = apiRoutes.categoryServiceProviders += theCategory

  // If we have geolocation support, run the geolocation promise and modify the url with lat lng,
  // Or if promise fails just run build function,
  // Or if geolocation isn't supported just run the build function.
  if (navigator.geolocation) {
    getLocation.location().then(function (position) {
      var latitude = position.coords.latitude
      var longitude = position.coords.longitude
      var locationUrl = categoryUrl += '/long/' + longitude + '/lat/' + latitude

      buildList(locationUrl)
    }).fail(function (error) {
      console.error('GEOLOCATION ERROR: ' + error)
      buildList(categoryUrl)
    })
  } else {
    buildList(categoryUrl)
  }

  function buildList (url) {
    // Get API data using promise
    getApiData.data(url).then(function (result) {
      // Append object name for Hogan
      var theData = { organisations: result }

      // Compile and render template
      var theTemplate = document.getElementById('js-category-result-tpl').innerHTML
      var compileTemplate = Hogan.compile(theTemplate)
      var theOutput = compileTemplate.render(theData)

      document.getElementById('js-category-result-output').innerHTML = theOutput

      accordion.init()
      loading.stop()
      socialShare.init()
    })
  }
})
