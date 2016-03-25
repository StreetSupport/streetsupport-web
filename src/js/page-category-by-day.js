// Common modules
import './common'

// Page modules
var urlParameter = require('./get-url-parameter')
var accordion = require('./accordion')
var FindHelp = require('./find-help')

// Lodash
var forEach = require('lodash/collection/forEach')
var sortBy = require('lodash/collection/sortBy')
var slice = require('lodash/array/slice')
var findIndex = require('lodash/array/findIndex')

var apiRoutes = require('./api')
var getApiData = require('./get-api-data')
var categoryEndpoint = require('./category-endpoint')
var templating = require('./template-render')
var Spinner = require('spin.js')
var analytics = require('./analytics')
var socialShare = require('./social-share')

var spin = document.getElementById('spin')
var loading = new Spinner().spin(spin)

var findHelp = new FindHelp()
findHelp.handleSubCategoryChange('day', accordion)
findHelp.buildCategories(apiRoutes.categoryServiceProvidersByDay, buildList)

function buildList (url) {
  getApiData.data(url).then(function (result) {
    if (result.status === 'error') {
      window.location.replace('/find-help.html')
    }
    var data = result.data

    var theTitle = data.categoryName + ' - Street Support'
    document.title = theTitle

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

      var dayIndexToOpen = findIndex(data.daysServices, function(day) {
        return day.name === urlParameter.parameter('day')
      })

      callback = function () {
        accordion.init(true, dayIndexToOpen, findHelp.buildListener('category-by-day', 'day'))
      }
    } else {
      template = 'js-category-no-results-result-tpl'
    }

    templating.renderTemplate(template, findHelp.buildViewModel('category-by-day', data), 'js-category-result-output', callback)

    loading.stop()
    analytics.init(theTitle)
    socialShare.init()
  })
}

function sortByOpeningTimes (days) {
  forEach(days, function (day) {
    day.serviceProviders = sortBy(day.serviceProviders, function (provider) {
      return provider.openingTime.startTime
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
