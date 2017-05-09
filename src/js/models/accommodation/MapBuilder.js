const gMaps = require('./googleMaps')

const MapBuilder = function () {
  const self = this

  const updateMarkers = (items) => {
    items
      .forEach((p) => {
        const infoWindow = gMaps.buildInfoWindow(p, self.buildInfoWindowMarkup(p))

        self.infoWindows.push(infoWindow)

        const marker = gMaps.buildMarker(p, self.map)

        marker.customFields = {
          mapIndex: p.mapIndex
        }

        marker.addListener('click', function () {
          self.infoWindows
            .forEach((w) => w.close())
          infoWindow.open(self.map, marker)
          self.container.markerClicked(this.customFields.mapIndex)
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

    updateMarkers(items)
  }

  self.init = function (items, userLocation, container, buildInfoWindowMarkup) {
    self.map = gMaps.buildMap(userLocation)

    self.container = container
    self.buildInfoWindowMarkup = buildInfoWindowMarkup

    self.markers
      .forEach((m) => m.setMap(null))

    self.infoWindows = []
    self.markers = []

    updateMarkers(items)
  }
}

module.exports = MapBuilder
