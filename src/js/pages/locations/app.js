// Common modules
import '../../common'
import htmlEncode from 'htmlencode'
import { categories } from '../../../data/generated/service-categories'

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
    if (reqLocation.length > 0) {
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
    if (result.length > 0) {
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
  const cats = categories
  cats.find((c) => c.key === 'accom').key = 'accommodation'

  const ui = {
    form: document.querySelector('.js-find-help-form'),
    select: document.querySelector('.js-find-help-cats'),
    postcode: document.querySelector('.js-find-help-postcode')
  }

  const allOrganisationsOption = document.createElement('option')
  allOrganisationsOption.setAttribute('value', 'all-service-providers')
  allOrganisationsOption.innerText = 'All Organisations'
  ui.select.appendChild(allOrganisationsOption)

  cats
    .forEach((c) => {
      const option = document.createElement('option')
      option.setAttribute('value', c.key)
      option.innerText = c.name
      ui.select.appendChild(option)
    })

  ui.postcode.setAttribute('placeholder', `your postcode: eg ${currentLocation.postcode}`)
  ui.postcode.value = currentLocation.postcode

  ui.form.addEventListener('submit', function (e) {
    e.preventDefault()
    const reqPostcode = ui.postcode.value
    const reqService = ui.select.value
    browser.redirect(`/find-help/${reqService}/?postcode=${reqPostcode}`)
  })
}

const initStatistics = function (currentLocation) {
  const stats = [
    { field: 'totalServiceProviders', link: '/find-help/all-service-providers/', label: 'Organisations' },
    { field: 'totalPledges', link: 'https://charter.streetsupport.net/progress/', label: 'Pledges' },
    { field: 'totalVolunteers', link: '/give-help/volunteer/', label: 'Volunteers' },
    { field: 'totalServices', link: '/find-help/', label: 'Services' },
    { field: 'totalNeeds', link: '/give-help/help/', label: 'Needs' }
  ]
  const requiredStats = currentLocation.homePageStats && currentLocation.homePageStats.length > 0
    ? currentLocation.homePageStats
    : ['totalServiceProviders', 'totalNeeds', 'totalServices']

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
      const zoom = currentLocation.id === 'bcp'
        ? 11 // stinky
        : 12
      map.init(result.data.items, currentLocation, null, buildInfoWindowMarkup, getLocation, { zoom })
    }, (_) => {
    })
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
