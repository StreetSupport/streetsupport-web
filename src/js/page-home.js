/* global google */

import './common'

const api = require('./get-api-data')
const browser = require('./browser')
const endpoints = require('./api')
const location = require('./location/locationSelector')
const googleMaps = require('./location/googleMaps')
const supportedCities = require('./location/supportedCities')
const templating = require('./template-render')

window.initMap = () => { }

const redirectToHubPage = function (locationId) {
  location.setCurrent(locationId)
  browser.redirect(`/${locationId}`)
}

const displayMap = function (hubs) {
  setTimeout(() => {
    const map = googleMaps.buildMap({ latitude: 52.776100, longitude: -1.777515 }, { zoom: 6 })

    hubs
      .forEach((l) => {
        const marker = googleMaps.buildMarker(l, map, {
          id: l.id,
          title: l.name,
          animation: google.maps.Animation.DROP,
          icon: {
            url: '/assets/img/map-pin.png',
            size: new google.maps.Size(34, 34),
            anchor: new google.maps.Point(15, 24)
          }
        })

        google.maps.event.addListener(marker, 'click', function () {
          redirectToHubPage(this.id)
        })
      })
  }, 1000)
}

const initLocationDropdown = function () {
  location.handler((result) => {
    if (result.length) {
      redirectToHubPage(result)
    }
  }, '.js-change-location-select')

  document.querySelector('.js-change-location-btn')
    .addEventListener('click', () => {
      const locationId = document.querySelector('.js-change-location-select').value
      if (locationId.length > 0) {
        redirectToHubPage(locationId)
      }
    })
}

const initStats = function () {
  const stats = [
    { field: 'totalServiceProviders', link: '/find-help/all-service-providers/', label: 'Organisations' },
    { field: 'totalServices', link: '/find-help/', label: 'Services' },
    { field: 'totalNeeds', link: '/give-help/help/', label: 'Needs' }
  ]
  const requiredStats = ['totalServiceProviders', 'totalServices', 'totalNeeds']
  api
    .data(endpoints.statistics + 'latest')
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

const init = () => {
  displayMap(supportedCities.locations)
  initLocationDropdown()
  initStats()
}

init()
