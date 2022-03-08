// Common modules
import '../../common'
import { cities } from '../../../data/generated/supported-cities'
import { categories } from '../../../data/generated/service-categories'
import htmlEncode from 'htmlencode'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const MapBuilder = require('../../models/accommodation/MapBuilder')
const templating = require('../../template-render')
const wp = require('../../wordpress')
const supportedCities = require('../../../js/location/supportedCities')
const mainCity = 'birmingham'
const countyKey = 'west-midlands'


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
    .getPostsByTag(countyKey, totalPostsToShow, 0, true)
    .then((result) => {
      if (result.posts.length === totalPostsToShow) {
        result.taxonomy.name = 'West Midlands'
        result.taxonomy.link = `https://news.streetsupport.net/tag/${countyKey}/`
        templating.renderTemplate('js-news-tpl', result, 'js-news-output')
      }
    })
}

const initStatistics = function () {
  const stats = [
    { field: 'totalServiceProviders', link: '#', label: 'Organisations' },
    { field: 'totalServices', link: '#', label: 'Services' },
    { field: 'totalNeeds', link: '#', label: 'Needs' }
  ]

  const requiredStats = ['totalServiceProviders', 'totalNeeds', 'totalServices']

  api
    .data(endpoints.statistics + countyKey + '/latest')
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


const currentLocation = supportedCities.get(mainCity)

initFindHelp(currentLocation)
initNews()
initStatistics()
initMap(cities.find((c) => c.id === mainCity))