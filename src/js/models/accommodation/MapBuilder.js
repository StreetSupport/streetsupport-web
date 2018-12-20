/* global google */

const gMaps = require('../../location/googleMaps')

let popup = null

const MapBuilder = function () {
  const self = this

  self.updateMarkers = (items) => {
    items
      .forEach((p, i) => {
        const infoWindow = gMaps.buildInfoWindow(self.buildInfoWindowMarkup(p))

        self.infoWindows.push(infoWindow)

        const marker = gMaps.buildMarker(self.getLocation(p), self.map)

        marker.customFields = {
          mapIndex: i
        }

        marker.addListener('click', function () {
          document.querySelectorAll('.card__gmaps-container')
            .forEach((p) => p.parentNode.removeChild(p))

          const location = self.getLocation(p)

          const position = new google.maps.LatLng(location.latitude, location.longitude)

          popup = new gMaps.Popup(
            location.latitude,
            location.longitude,
            self.buildInfoWindowMarkup(p))

          popup.setMap(self.map)
          self.map.setCenter(position)
          if (self.container) {
            self.container.markerClicked(this.customFields.mapIndex)
          }
        })

        self.markers.push(marker)
      })
  }

  self.infoWindows = []
  self.markers = []

  self.itemSelected = function (item) {
    const itemIndex = item.mapIndex()
    self.infoWindows[itemIndex].open(self.map, self.markers[itemIndex])
    self.infoWindows
      .filter((iw, i) => i !== itemIndex)
      .forEach((iw, i) => {
        iw.close()
      })
  }

  self.update = function (items) {
    self.infoWindows = []

    self.markers
      .forEach((m) => {
        m.setVisible(false)
        m.setMap(null)
      })

    self.markers = []

    self.updateMarkers(items)
  }

  self.init = function (items, userLocation, container, buildInfoWindowMarkup, getLocation = (p) => {
    return { latitude: p.latitude(), longitude: p.longitude() }
  }, customOptions = {}) {
    self.map = gMaps.buildMap(userLocation, customOptions)

    self.container = container
    self.buildInfoWindowMarkup = buildInfoWindowMarkup
    self.getLocation = getLocation

    self.markers
      .forEach((m) => m.setMap(null))

    self.infoWindows = []
    self.markers = []

    self.updateMarkers(items)
  }
}

module.exports = MapBuilder
