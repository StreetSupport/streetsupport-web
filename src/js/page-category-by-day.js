// Common modules
import './common'

// Page modules
var querystring = require('./get-url-parameter')
var accordion = require('./accordion')
var FindHelp = require('./find-help')
var marked = require('marked')
marked.setOptions({sanitize: true})

// Lodash
var forEach = require('lodash/collection/forEach')
var sortBy = require('lodash/collection/sortBy')
var slice = require('lodash/array/slice')
var findIndex = require('lodash/array/findIndex')

var apiRoutes = require('./api')
var getApiData = require('./get-api-data')
var templating = require('./template-render')
var analytics = require('./analytics')
var socialShare = require('./social-share')
var browser = require('./browser')
let locationSelector = require('./location/locationSelector')
let findHelp = null
let currentLocation = null

let onChangeLocation = (newLocation) => {
  if (newLocation === 'elsewhere') {
    newLocation = 'my-location'
  }
  window.location.href = '/find-help/category-by-day?category=' + findHelp.theCategory + '&location=' + newLocation
}

function buildList (url) {
  getApiData.data(url)
  .then(function (result) {
    if (result.status === 'error') {
      window.location.replace('/find-help/')
    }
    var data = result.data

    var theTitle = data.categoryName + ' - Street Support'
    document.title = theTitle

    var template = ''
    var onRenderCallback = function () {
      locationSelector.handler(onChangeLocation)
      findHelp.initFindHelpLocationSelector()
      browser.initPrint()
      browser.loaded()
      socialShare.init()
    }

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

      var dayIndexToOpen = findIndex(data.daysServices, function (day) {
        return day.name === querystring.parameter('day')
      })

      onRenderCallback = function () {
        locationSelector.handler(onChangeLocation)
        accordion.init(true, dayIndexToOpen, findHelp.buildListener('category-by-day', 'day'))
        analytics.init(theTitle)
        findHelp.initFindHelpLocationSelector()

        browser.initPrint()

        browser.loaded()
        socialShare.init()
      }
    } else {
      template = 'js-category-no-results-result-tpl'
    }

    let viewModel = {
      organisations: data,
      categoryId: data.categoryKey,
      categoryName: data.categoryName,
      categorySynopsis: marked(data.synopsis),
      location: currentLocation.name
    }
    templating.renderTemplate(template, viewModel, 'js-category-result-output', onRenderCallback)
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

let init = () => {
  browser.loading()
  locationSelector
    .getCurrent()
    .then((result) => {
      currentLocation = result
      findHelp = new FindHelp(result.findHelpId)
      findHelp.handleSubCategoryChange('day', accordion)
      let reqSubCat = querystring.parameter('sub-category')
      findHelp.setUrl('category-by-day', 'sub-category', reqSubCat)

      let category = querystring.parameter('category')
      let location = querystring.parameter('location')

      let url = apiRoutes.cities + result.id + '/services-by-day/' + findHelp.theCategory
      if (location === 'my-location') {
        url = apiRoutes.categoryServiceProvidersByDay + category + '/long/' + result.longitude + '/lat/' + result.latitude
      }

      buildList(url)
    }, (_) => {
    })
}

init()
