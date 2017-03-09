// Common modules
import './common'

// Page modules
var querystring = require('./get-url-parameter')
var accordion = require('./accordion')
var FindHelp = require('./find-help')
var marked = require('marked')
marked.setOptions({sanitize: true})
var htmlencode = require('htmlencode')

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
  window.location.href = `/find-help/${findHelp.theCategory}/timetable?location=${newLocation}`
}

function buildList (url) {
  getApiData.data(url)
  .then(function (result) {
    if (result.status === 'error') {
      window.location.replace('/find-help/')
    }
    var data = result.data

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

      data.daysServices.forEach(function (subCat) {
        subCat.serviceProviders.forEach(function (provider) {
          if (provider.tags !== null) {
            provider.tags = provider.tags.join(', ')
          }
          provider.serviceInfo = htmlencode.htmlDecode(provider.serviceInfo)
        })
      })

      var dayIndexToOpen = data.daysServices.findIndex(function (day) {
        return day.name === querystring.parameter('day')
      })

      onRenderCallback = function () {
        locationSelector.handler(onChangeLocation)
        accordion.init(true, dayIndexToOpen, findHelp.buildListener('category-by-day', 'day'))
        analytics.init(document.title)
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
      location: currentLocation.name,
      geoLocationUnavailable: currentLocation.geoLocationUnavailable
    }
    templating.renderTemplate(template, viewModel, 'js-category-result-output', onRenderCallback)
  })
}

function sortByOpeningTimes (days) {
  days.forEach(function (day) {
    day.serviceProviders = day.serviceProviders.sort((a, b) => {
      if (a.openingTime.startTime < b.openingTime.startTime) return -1
      if (a.openingTime.startTime > b.openingTime.startTime) return 1
      return 0
    })
  })
  return days
}

function sortDaysFromToday (days) {
  // api days: monday == 0!
  var today = new Date().getDay() - 1
  var past = days.slice(0, today)
  var todayToTail = days.slice(today)
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

      let location = querystring.parameter('location')

      let url = apiRoutes.cities + result.id + '/services-by-day/' + findHelp.theCategory
      if (location === 'my-location') {
        url = apiRoutes.categoryServiceProvidersByDay + findHelp.theCategory + '/long/' + result.longitude + '/lat/' + result.latitude
      }

      buildList(url)
    }, (_) => {
    })
}

init()
