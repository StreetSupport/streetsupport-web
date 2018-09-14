/* global alert */

// Common modules
import '../../common'

import htmlEncode from 'htmlencode'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const location = require('../../location/locationSelector')
const templating = require('../../template-render')
const wp = require('../../wordpress')
const MapBuilder = require('../../models/accommodation/MapBuilder')

const initLocations = function (currentLocationId) {
  const ui = {
    form: document.querySelector('.js-change-location-form'),
    select: document.querySelector('.js-change-location-select')
  }

  ui.form.addEventListener('submit', function (e) {
    e.preventDefault()
    const reqLocation = ui.select.value
    if (reqLocation) {
      location.setCurrent(reqLocation)
      browser.redirect(`/${reqLocation}`)
    }
  })

  const redirectToHubPage = function (locationId) {
    location.setCurrent(locationId)
    browser.redirect(`/${locationId}`)
  }

  Array.from(document.querySelector('.js-change-location-select'))
  .filter((t) => t.tagName === 'OPTION')
  .find((o) => o.value === currentLocationId)
  .setAttribute('selected', 'selected')

  location.handler((result) => {
    if (result.length) {
      redirectToHubPage(result)
    }
  }, '.js-change-location-select')
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
                <button class="card__close js-popup-close" title="close">&#10799;</button>
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
      const zoom = currentLocation.id === 'bournemouth'
        ? 11 // stinky
        : 12
      map.init(result.data.items, currentLocation, null, buildInfoWindowMarkup, getLocation, { zoom })
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

const initSwep = function (currentLocationId) {
  api
  .data(endpoints.cities)
  .then((result) => {
    const city = result.data.find((c) => c.id === currentLocationId)
    if (city.swepIsAvailable) {
      templating.renderTemplate('js-swep-tpl', city, 'js-swep-output')
    }
  }, (_) => {})
}

const currentLocation = location.getCurrentHub()

initLocations(currentLocation.id)
initNews(currentLocation.id)
initFindHelp(currentLocation)
initStatistics(currentLocation)
initMap(currentLocation)
initSwep(currentLocation.id)

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
