const gMaps = require('../../location/googleMaps')

const MapBuilder = function () {
  const self = this

  self.updateMarkers = (items) => {
    items
      .forEach((p, i) => {
        const infoWindow = gMaps.buildInfoWindow(self.buildInfoWindowMarkup(p))

        self.infoWindows.push(infoWindow)

        const marker = gMaps.buildMarker({ latitude: p.latitude(), longitude: p.longitude() }, self.map, {
          icon: `http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=${p.mapIndex() + 1}|FE6256|000000`
        })

        marker.customFields = {
          mapIndex: i
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

    self.updateMarkers(items)
  }

  self.init = function (items, userLocation, container, buildInfoWindowMarkup) {
    console.log({items})
    self.map = gMaps.buildMap(userLocation)

    self.container = container
    self.buildInfoWindowMarkup = buildInfoWindowMarkup

    self.markers
      .forEach((m) => m.setMap(null))

    self.infoWindows = []
    self.markers = []

    self.updateMarkers(items)
  }
}

module.exports = MapBuilder
