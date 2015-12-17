// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var urlParameter = require('./get-url-parameter')
var accordion = require('./accordion')
var socialShare = require('./social-share')

// Lodash
var forEach = require('lodash/collection/forEach')
var sortBy = require('lodash/collection/sortBy')
var slice = require('lodash/array/slice')

nav.init()
FastClick.attach(document.body)

// Load and process data
require.ensure(['./api', './get-api-data', './category-endpoint', 'hogan.js', 'spin.js'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var Hogan = require('hogan.js')
  var categoryEndpoint = require('./category-endpoint')
  var Spinner = require('spin.js')

  // Spinner
  var spin = document.getElementById('spin')
  var loading = new Spinner().spin(spin)

  // Get category and create URL
  var theCategory = urlParameter.parameter('category')
  var theLocation = urlParameter.parameter('location')
  var categoryUrl = apiRoutes.categoryServiceProvidersByDay += theCategory

  buildList(categoryEndpoint.getEndpointUrl(categoryUrl, theLocation))

  function buildList (url) {
    // Get API data using promise
    getApiData.data(url).then(function (result) {
      // Append object name for Hogan
      var template = ''
      var callback = function () {}

      if (result.daysServices.length) {
        template = 'js-category-result-tpl'

        result.daysServices = sortByOpeningTimes(sortDaysFromToday(result.daysServices))

        callback = function () {
          accordion.init()
        }
      } else {
        template = 'js-category-no-results-result-tpl'
      }

      var theData = { organisations: result }
      renderTemplate(template, theData, 'js-category-result-output', callback)

      loading.stop()
      socialShare.init()
    })
  }

  function sortByOpeningTimes (days) {
    forEach(days, function (day) {
      day.serviceProviders = sortBy(day.serviceProviders, function (provider) {
        return provider.openingTimes.startTime
      })
    })

    return days
  }

  function sortDaysFromToday (days) {
    // api days: monday == 0!
    var today = new Date().getDay() - 1
    var past = slice(days, 0, today)
    var todayToTail = slice(days, today)
    return todayToTail.concat(past)
  }

  function renderTemplate (templateId, data, output, callback) {
    var theTemplate = document.getElementById(templateId).innerHTML
    var compileTemplate = Hogan.compile(theTemplate)
    document.getElementById(output).innerHTML = compileTemplate.render(data)
    callback()
  }
})
