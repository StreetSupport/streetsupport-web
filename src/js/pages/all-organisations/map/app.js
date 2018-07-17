// Common modules
import '../../../common'
const htmlEncode = require('htmlencode')
const marked = require('marked')
marked.setOptions({ sanitize: true })

const ko = require('knockout')

const locationSelector = require('../../../location/locationSelector')
const googleMaps = require('../../../location/googleMaps')
const proximityRanges = require('../../../location/proximityRanges')

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

window.initMap = () => { }

const displayMap = function (providers, userLocation) {
  const map = googleMaps.buildMap(userLocation, { zoom: proximityRanges.getByRange(model.range()) })
  const infoWindows = []

  providers
    .forEach((p) => {
      const infoWindow = googleMaps.buildInfoWindow(buildInfoWindowMarkup(p))
      infoWindows.push(infoWindow)

      p.locations
        .forEach((l) => {
          const marker = googleMaps.buildMarker(l, map, { title: `${htmlEncode.htmlDecode(p.name)}` })

          marker.addListener('click', () => {
            infoWindows
              .forEach((w) => w.close())
            infoWindow.open(map, marker)
          })
        })
    })

  googleMaps.addCircleMarker(userLocation, map)
}

model.organisations.subscribe((newValue) => {
  locationSelector
    .getPreviouslySetPostcode()
    .then((result) => {
      displayMap(newValue, result)
    })
})
