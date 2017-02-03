/*
  global google
*/

// Common modules
import './common'
let sortBy = require('lodash/collection/sortBy')
let htmlEncode = require('htmlencode')

let apiRoutes = require('./api')
let getApiData = require('./get-api-data')
let templating = require('./template-render')
let browser = require('./browser')
let querystring = require('./get-url-parameter')
let locationSelector = require('./location/locationSelector')

let onChangeLocation = (newLocation) => {
  window.location.href = '/find-help/all-service-providers/?location=' + newLocation
}

const buildInfoWindowMarkup = (p) => {
  return `<div class="map-info-window">
      <h1 class="h2"><a href="/find-help/organisation/?organisation=${p.key}">${htmlEncode.htmlDecode(p.name)}</a></h1>
      <p>${htmlEncode.htmlDecode(p.shortDescription)}</p>
      <a href="/find-help/organisation/?organisation=${p.key}" class="btn btn--brand-e">
        <span class="btn__text">More about ${htmlEncode.htmlDecode(p.name)}</span>
      </a>
    </div>`
}

const buildMap = (userLocation) => {
  const centre = {lat: userLocation.latitude, lng: userLocation.longitude}
  return new google.maps.Map(document.querySelector('.js-map'), {
    zoom: 11,
    center: centre
  })
}

window.initMap = () => {}

const displayMap = function (providers, userLocation) {
  const map = buildMap(userLocation)

  const infoWindows = []

  providers
    .forEach((p) => {
      if (p.addresses.length === 0) return

      const infoWindow = new google.maps.InfoWindow({
        content: buildInfoWindowMarkup(p)
      })

      infoWindows.push(infoWindow)

      const marker = new google.maps.Marker({
        position: { lat: p.addresses[0].latitude, lng: p.addresses[0].longitude },
        map: map,
        title: `${htmlEncode.htmlDecode(p.name)}`
      })

      marker.addListener('click', () => {
        infoWindows
          .forEach((w) => w.close())
        infoWindow.open(map, marker)
      })
    })

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      new google.maps.Marker({ // eslint-disable-line
        position: pos,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 3,
          fillColor: 'blue',
          strokeColor: 'blue'
        },
        map: map
      })
    }, function () {
    })
  } else {
    // Browser doesn't support Geolocation
  }
}

let getData = (currentLocation) => {
  if (window.location.search.length === 0) {
    var saved = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*=\s*([^;]*).*$)|^.*$/, '$1')
    if (saved !== undefined && saved.length > 0 && saved !== 'my-location') {
      onChangeLocation(saved)
    }
  }

  getApiData.data(apiRoutes.serviceProviders + querystring.parameter('location'))
    .then((result) => {
      const callback = () => {
        locationSelector.handler(onChangeLocation)
        browser.loaded()
        displayMap(result.data, currentLocation)
      }
      if (result.data.length === 0) {
        let theData = {
          location: currentLocation.name
        }
        templating.renderTemplate('js-category-no-result-tpl', theData, 'js-category-result-output', callback)
      } else {
        let sorted = sortBy(result.data, function (provider) {
          return provider.name.toLowerCase()
        })

        let theData = {
          organisations: sorted,
          location: currentLocation.name
        }

        templating.renderTemplate('js-category-result-tpl', theData, 'js-category-result-output', callback)
      }
    })
}

let init = () => {
  browser.loading()
  locationSelector
    .getCurrent()
    .then((result) => {
      getData(result)
    })
}

init()
