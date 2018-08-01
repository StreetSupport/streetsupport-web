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
  wp
    .getPostsByLocation(currentLocationId, 3, 0, true)
    .then((posts) => {
      templating.renderTemplate('js-news-tpl', posts, 'js-news-output')
    })
}

const initFindHelp = function () {
  const ui = {
    form: document.querySelector('.js-find-help-form'),
    postcode: document.querySelector('.js-find-help-postcode')
  }

  ui.form.addEventListener('submit', function (e) {
    e.preventDefault()
    const reqLocation = ui.postcode.value
    location.setPostcode(reqLocation, () => {
      browser.redirect('/find-help/all-service-providers/')
    }, () => alert('We could not find your postcode, please try a nearby one'))
  })
}

const initStatistics = function (currentLocationId) {
  api
    .data(endpoints.statistics + currentLocationId + '/latest')
    .then((stats) => {
      const theData = {
        statistics: stats.data
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

const currentLocation = location.getCurrentHub()
if (currentLocation.id !== 'manchester') {
  location.setCurrent('manchester')
  browser.reload()
}

initLocations(currentLocation.id)
initNews(currentLocation.id)
initFindHelp()
initStatistics(currentLocation.id)
initMap(currentLocation)
