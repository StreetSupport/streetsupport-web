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
require.ensure(['./api', './get-api-data', './category-endpoint', './template-render', 'spin.js', './analytics'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var categoryEndpoint = require('./category-endpoint')
  var templating = require('./template-render')
  var Spinner = require('spin.js')
  var analytics = require('./analytics')

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
      var data = result.data
      // Get category name and edit page title
      var theTitle = data.categoryName + ' - Street Support'
      document.title = theTitle

      // Append object name for Hogan
      var template = ''
      var callback = function () {}

      if (data.daysServices.length) {
        template = 'js-category-result-tpl'

        data.daysServices = sortByOpeningTimes(sortDaysFromToday(data.daysServices))

        forEach(data.daysServices, function (subCat) {
          forEach(subCat.serviceProviders, function (provider) {
            if (provider.tags !== null) {
              provider.tags = provider.tags.join(', ')
            }
          })
        })

        callback = function () {
          accordion.init(true)
        }
      } else {
        template = 'js-category-no-results-result-tpl'
      }

      var theData = { organisations: data }
      templating.renderTemplate(template, theData, 'js-category-result-output', callback)

      loading.stop()
      analytics.init(theTitle)
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
})
