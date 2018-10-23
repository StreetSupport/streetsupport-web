/* global alert */

// Common modules
import '../../common'
import { cities } from '../../../data/generated/supported-cities'
import htmlEncode from 'htmlencode'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const location = require('../../location/locationSelector')
const MapBuilder = require('../../models/accommodation/MapBuilder')
const templating = require('../../template-render')
const wp = require('../../wordpress')

const initForms = function (currentLocation) {
  const findHelp = {
    form: document.querySelector('.js-find-help-form'),
    postcode: document.querySelector('.js-find-help-postcode')
  }

  findHelp.postcode.value = currentLocation.postcode
  findHelp.form.addEventListener('submit', function (e) {
    e.preventDefault()
    const reqLocation = findHelp.postcode.value
    location.setPostcode(reqLocation, () => {
      browser.redirect('/find-help/')
    }, () => alert('We could not find your postcode, please try a nearby one'))
  })

  const giveHelp = {
    form: document.querySelector('.js-give-help-form'),
    postcode: document.querySelector('.js-give-help-postcode')
  }

  giveHelp.postcode.value = currentLocation.postcode
  giveHelp.form.addEventListener('submit', function (e) {
    e.preventDefault()
    const reqLocation = giveHelp.postcode.value
    location.setPostcode(reqLocation, () => {
      browser.redirect('/give-help/help')
    }, () => alert('We could not find your postcode, please try a nearby one'))
  })
}

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
      const zoom = 10
      map.init(result.data.items, currentLocation, null, buildInfoWindowMarkup, getLocation, { zoom })
    }, (_) => {
    })
}

const initNews = function () {
  const totalPostsToShow = 3
  wp
    .getPostsByTag('greater-manchester', totalPostsToShow, 0, true)
    .then((result) => {
      if (result.posts.length === totalPostsToShow) {
        result.taxonomy.name = 'Greater Manchester'
        result.taxonomy.link = 'https://news.streetsupport.net/tag/greater-manchester/'
        templating.renderTemplate('js-news-tpl', result, 'js-news-output')
      }
    })
}

initNews()
initMap(cities.find((c) => c.id === 'manchester'))

location
  .getPreviouslySetPostcode()
  .then((result) => {
    initForms(result)
    initLocations(result.id)
  })
