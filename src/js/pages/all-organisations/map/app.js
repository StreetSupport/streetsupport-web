/* global google */

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

window.initMap = function () {
  const buildInfoWindowMarkup = (p) => {
    return `<div class="card card--brand-h card--gmaps">
              <div class="card__title">
                <button class="card__close js-popup-close" title="close">&#10799;</button>
                <h1 class="h2">${htmlEncode.htmlDecode(p.name)}</h1>
                <p>${htmlEncode.htmlDecode(p.synopsis)}</p>
              </div>
              <div class="card__details">
                <a href="/find-help/organisation/?organisation=${p.key}">View details</a>
              </div>
            </div>`
  }

  const displayMap = function (providers, userLocation) {
    const map = googleMaps.buildMap(userLocation, { zoom: proximityRanges.getByRange(model.range()) })
    let popup = null

    providers
      .forEach((p) => {
        p.locations
          .forEach((l) => {
            const marker = googleMaps.buildMarker(l, map, { title: `${htmlEncode.htmlDecode(p.name)}` })
            marker.addListener('click', function () {
              document.querySelectorAll('.card__gmaps-container')
                .forEach((p) => p.parentNode.removeChild(p))
              popup = new googleMaps.Popup(
                this.position.lat(),
                this.position.lng(),
                buildInfoWindowMarkup(p))
              popup.setMap(map)
              map.setCenter(new google.maps.LatLng(this.position.lat(), this.position.lng()))
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
}
