/*
  global google
*/

// Common modules
import '../../../common'
const htmlEncode = require('htmlencode')
const marked = require('marked')
marked.setOptions({sanitize: true})

const ko = require('knockout')

const locationSelector = require('../../../location/locationSelector')

const OrgRetrieval = require('../../../models/all-organisations/listing')
const model = new OrgRetrieval()
ko.applyBindings(model)

const buildInfoWindowMarkup = (p) => {
  return `<div class="map-info-window">
      <h1 class="h2"><a href="/find-help/organisation/?organisation=${p.key}">${htmlEncode.htmlDecode(p.name)}</a></h1>
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
      const infoWindow = new google.maps.InfoWindow({
        content: buildInfoWindowMarkup(p)
      })

      infoWindows.push(infoWindow)

      p.locations
        .forEach((l) => {
          const marker = new google.maps.Marker({
            position: { lat: l.latitude, lng: l.longitude },
            map: map,
            title: `${htmlEncode.htmlDecode(p.name)}`
          })

          marker.addListener('click', () => {
            infoWindows
              .forEach((w) => w.close())
            infoWindow.open(map, marker)
          })
        })
    })

  const pos = {
    lat: userLocation.latitude,
    lng: userLocation.longitude
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
}

model.organisations.subscribe((newValue) => {
  locationSelector
    .getPreviouslySetPostcode()
    .then((result) => {
      displayMap(newValue, result)
    })
})
