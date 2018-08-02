/* global alert */

// Common modules
import '../../common'

import htmlEncode from 'htmlencode'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const location = require('../../location/locationSelector')
const supportedCities = require('../../location/supportedCities')
const templating = require('../../template-render')
const wp = require('../../wordpress')
const MapBuilder = require('../../models/accommodation/MapBuilder')

const initLocations = function (currentLocationId) {
  const callback = () => {
    const ui = {
      form: document.querySelector('.js-change-location-form'),
      select: document.querySelector('.js-change-location-select')
    }

    ui.form.addEventListener('submit', function (e) {
      e.preventDefault()
      const reqLocation = ui.select.value
      if (reqLocation) {
        browser.redirect(`/${reqLocation}`)
      }
    })
  }

  const locations = supportedCities.locations.map((c) => {
    return {
      id: c.id,
      name: c.name,
      isSelected: c.id === currentLocationId
    }
  })
  const theData = {
    locations: [{ name: 'Select a location' }, ...locations]
  }
  templating.renderTemplate('js-location-selector-tpl', theData, 'js-location-selector-output', callback)
}

const initNews = function (currentLocationId) {
  const reqPosts = 3
  wp
    .getPostsByLocation(currentLocationId, reqPosts, 0, true)
    .then((result) => {
      if (result.posts.length === reqPosts) {
        templating.renderTemplate('js-news-tpl', result, 'js-news-output')
      }
    })
}

const initFindHelp = function (currentLocation) {
  const ui = {
    form: document.querySelector('.js-find-help-form'),
    postcode: document.querySelector('.js-find-help-postcode')
  }

  ui.postcode.setAttribute('placeholder', `your postcode: eg ${currentLocation.postcode}`)
  ui.postcode.value = currentLocation.postcode

  ui.form.addEventListener('submit', function (e) {
    e.preventDefault()
    const reqLocation = ui.postcode.value
    location.setPostcode(reqLocation, () => {
      browser.redirect('/find-help/all-service-providers/')
    }, () => alert('We could not find your postcode, please try a nearby one'))
  })
}

const initStatistics = function (currentLocation) {
  const stats = [
    { field: 'totalServiceProviders', link: '/find-help/all-service-providers/', label: 'Organisations' },
    { field: 'totalPledges', link: 'https://charter.streetsupport.net/progress/', label: 'Pledges' },
    { field: 'totalVolunteers', link: '/give-help/volunteer/', label: 'Volunteers' },
    { field: 'totalNeeds', link: '/give-help/help/', label: 'Needs' }
  ]
  const requiredStats = currentLocation.homePageStats || ['totalServiceProviders', 'totalNeeds', 'totalVolunteers']
  api
    .data(endpoints.statistics + currentLocation.id + '/latest')
    .then((result) => {
      const theData = {
        statistics: requiredStats
          .map((rs) => {
            const reqStat = stats.find((s) => s.field === rs)
            return {
              total: result.data[rs],
              link: reqStat.link,
              label: reqStat.label
            }
          })
      }

      templating.renderTemplate('js-statistics-tpl', theData, 'js-statistics-output')
    }, (_) => {
    })
}
window.initMap = () => { }

const initMap = function (currentLocation) {
  const endpoint = `${endpoints.serviceProviderLocations}?latitude=${currentLocation.latitude}&longitude=${currentLocation.longitude}&range=20000&pageSize=1000`

  const buildInfoWindowMarkup = (p) => {
    return `<div class="card card--brand-h card--gmaps">
              <div class="card__title">
                <h1 class="h2">${htmlEncode.htmlDecode(p.serviceProviderName)}</h1>
                <p>${htmlEncode.htmlDecode(p.serviceProviderSynopsis)}</p>
              </div>
              <div class="card__details">
                <a href="/find-help/organisation/?organisation=${p.serviceProviderKey}">View details</a>
              </div>
            </div>`
  }
  const getLocation = (p) => {
    return { latitude: p.latitude, longitude: p.longitude }
  }
  const map = new MapBuilder()
  api
    .data(endpoint)
    .then((result) => {
      map.init(result.data.items, currentLocation, null, buildInfoWindowMarkup, getLocation)
    }, (_) => {
    })
}

const initToolkit = function () {
  templating.renderTemplate('js-toolkit-tpl', {}, 'js-toolkit-output')
}

const initCharter = function () {
  templating.renderTemplate('js-charter-tpl', {}, 'js-charter-output')
}

const initBigChange = function () {
  templating.renderTemplate('js-big-change-tpl', {}, 'js-big-change-output')
}

const re = new RegExp(/\/(.*)\//)
const reqLocation = browser.location().pathname.match(re)[1].split('/')[0]

const currentLocation = location.getCurrentHub()
if (currentLocation.id !== reqLocation) {
  location.setCurrent(reqLocation)
  browser.reload()
}

initLocations(currentLocation.id)
initNews(currentLocation.id)
initFindHelp(currentLocation)
initStatistics(currentLocation)
initMap(currentLocation)

const availableFeatures = [
  { isEnabledFlag: 'toolkitIsEnabled', init: initToolkit },
  { isEnabledFlag: 'charterIsEnabled', init: initCharter },
  { isEnabledFlag: 'bigChangeIsEnabled', init: initBigChange }
]

availableFeatures
  .forEach((f) => {
    if (currentLocation[f.isEnabledFlag]) {
      f.init()
    }
  })
