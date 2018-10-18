// Common modules
import './common'

// Page modules
const querystring = require('./get-url-parameter')
const accordion = require('./accordion')
const FindHelp = require('./find-help')
const marked = require('marked')
marked.setOptions({ sanitize: true })
const htmlencode = require('htmlencode')

const apiRoutes = require('./api')
const getApiData = require('./get-api-data')
const templating = require('./template-render')
const analytics = require('./analytics')
const browser = require('./browser')
const locationSelector = require('./location/locationSelector')
const categories = require('../data/generated/service-categories')

const timesOfDay = [
  { id: 'Morning', startTime: '06:00', endTime: '12:00' },
  { id: 'Afternoon', startTime: '12:00', endTime: '17:00' },
  { id: 'Evening', startTime: '17:00', endTime: '24:00' }
]

let findHelp = null

const bindFilters = function () {
  document.querySelector('.js-filter-by-day')
    .addEventListener('change', function () {
      openAccordion(this.value)
      findHelp.scrollTo(this.value)
    })
  document.querySelector('.js-filter-by-time')
    .addEventListener('change', function () {
      const selectedTimeOfDay = timesOfDay.find((t) => t.id === this.value)
      const resultItems = Array.from(document.querySelectorAll('.result-detail__item'))
      resultItems
        .forEach((i) => {
          i.style.display = 'block'
        })

      if (selectedTimeOfDay !== undefined) {
        resultItems
          .filter((i) => {
            return !(
              (i.getAttribute('data-start-time') < selectedTimeOfDay.startTime &&
              i.getAttribute('data-end-time') > selectedTimeOfDay.startTime) ||
              (i.getAttribute('data-start-time') > selectedTimeOfDay.startTime &&
              i.getAttribute('data-start-time') < selectedTimeOfDay.endTime))
          })
          .forEach((i) => {
            i.style.display = 'none'
          })
      }
    })
}

const onLocationCriteriaChange = (result, range) => {
  browser.loading()
  buildList(buildUrl(result, range), result)
}

let onRenderCallback = function () {
  findHelp = new FindHelp('my-location')
  findHelp.initFindHelpPostcodesLocationSelector(onLocationCriteriaChange)
  findHelp.setUrl('category', 'sub-category', querystring.parameter('sub-category'))

  browser.loaded()
  bindFilters()
}

function buildList (url, locationResult) {
  getApiData.data(url)
    .then((result) => {
      if (result.status === 'error') {
        window.location.replace('/find-help/')
      }
      const data = result.data

      let template = ''

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
          findHelp = new FindHelp('my-location')
          findHelp.initFindHelpPostcodesLocationSelector(onLocationCriteriaChange)
          findHelp.setUrl('category', 'sub-category', querystring.parameter('sub-category'))

          accordion.init(true, dayIndexToOpen, findHelp.buildListener('category-by-day', 'day'))
          analytics.init(document.title)

          browser.loaded()
          bindFilters()
        }
      } else {
        template = 'js-category-no-results-result-tpl'
      }

      const viewModel = {
        organisations: data,
        categoryId: data.categoryKey,
        categoryName: data.categoryName,
        categorySynopsis: marked(data.synopsis),
        daysOfWeek: data.daysServices.map((ds) => { return { id: ds.name } }),
        timesOfDay: timesOfDay,
        location: locationResult.name,
        postcode: locationResult.postcode,
        nearestSupportedId: locationResult.nearestSupported !== undefined ? locationResult.nearestSupported.id : '',
        nearestSupportedName: locationResult.nearestSupported !== undefined ? locationResult.nearestSupported.name : '',
        selectedRange: querystring.parameter('range'),
        geoLocationUnavailable: locationResult.geoLocationUnavailable
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

const buildUrl = (locationResult, range = querystring.parameter('range')) => {
  return `${apiRoutes.categoryServiceProvidersByDay}${findHelp.theCategory}/long/${locationResult.longitude}/lat/${locationResult.latitude}?range=${range}`
}

const openAccordion = function (subCategory) {
  var el = document.getElementById(subCategory)
  var context = document.querySelector('.js-accordion')

  var useAnalytics = true

  accordion.reOpen(el, context, useAnalytics)
}

const initAccordionHistoryBackHandler = function (subCategoryKey, accordion) {
  window.onpopstate = function () {
    var subCategory = querystring.parameter(subCategoryKey)
    if (subCategory.length) {
      openAccordion(subCategory)
    }
  }
}

const init = () => {
  browser.loading()
  locationSelector
    .getPreviouslySetPostcode()
    .then((result) => {
      findHelp = new FindHelp('my-location')
      if (result) {
        initAccordionHistoryBackHandler('day', accordion)
        buildList(buildUrl(result), result)
      } else {
        const categoryId = findHelp.theCategory
        const category = categories.categories.find((c) => c.key === categoryId)

        const viewModel = {
          categoryId: category.key,
          categoryName: category.name,
          categorySynopsis: marked(category.synopsis),
          geoLocationUnavailable: false
        }

        templating.renderTemplate('js-category-no-results-result-tpl', viewModel, 'js-category-result-output', onRenderCallback)
      }
    }, (_) => {
    })
}

init()
