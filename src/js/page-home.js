/* global google */

import './common'

let location = require('./location/locationSelector')
const templating = require('./template-render')
const browser = require('./browser')
const supportedCities = require('./location/supportedCities')

const buildMap = () => {
  return new google.maps.Map(document.querySelector('.js-map'), {
    zoom: 6,
    center: { lat: 52.776100, lng: -1.777515 }
  })
}

window.initMap = () => { }

const redirectToHubPage = function (locationId) {
  location.setCurrent(locationId)
  browser.redirect(`/${locationId}`)
}

const displayMap = function (hubs) {
  setTimeout(() => {
    const map = buildMap()

    hubs
      .forEach((l) => {
        const marker = new google.maps.Marker({
          position: { lat: l.latitude, lng: l.longitude },
          map: map,
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

const init = () => {
  const theData = {
    locations: [{ id: '', name: '- Select a hub -' }, ...supportedCities.locations]
  }
  const callback = function () {
    location.handler((result) => {
      if (result.length) {
        redirectToHubPage(result)
      }
    }, '.js-homepage-promo-location-selector')

    displayMap(supportedCities.locations)
  }

  templating.renderTemplate('js-content-tpl', theData, 'js-template-output', callback)
}

init()
