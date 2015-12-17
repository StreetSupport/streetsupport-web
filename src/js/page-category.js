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
  var theLocation = urlParameter.parameter('location')
  var categoryUrl = apiRoutes.categoryServiceProviders += theCategory

  var locations = [
    {
      'key': 'manchester',
      'name': 'Manchester',
      'longitude': -2.24455696347558,
      'latitude':53.4792777155671
    },
    {
      'key': 'leeds',
      'name': 'Leeds',
      'longitude': -1.54511238485298,
      'latitude':53.7954906003838
    }
  ]

  if (theLocation.length) {
    var requestedLocation = find(locations, function(loc) {
      return loc.key === theLocation
    })
  }

  if(requestedLocation !== false) {
    var latitude = requestedLocation.latitude
    var longitude = requestedLocation.longitude
    var locationUrl = categoryUrl += '/long/' + longitude + '/lat/' + latitude

    console.log(requestedLocation)

    buildList(locationUrl)
  } else if (navigator.geolocation) {
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
      var template = ''
      var callback = function () {}

      if (result.subCategories.length) {
        template = 'js-category-result-tpl'
        callback = function () {
          accordion.init()
        }
      } else {
        template = 'js-category-no-results-result-tpl'
      }

      renderTemplate(template, theData, 'js-category-result-output', callback)

      loading.stop()
      socialShare.init()
    })
  }

  function renderTemplate (templateId, data, output, callback) {
    var theTemplate = document.getElementById(templateId).innerHTML
    var compileTemplate = Hogan.compile(theTemplate)
    document.getElementById(output).innerHTML = compileTemplate.render(data)
    callback()
  }
})
