const locationSelector = require('../../location/locationSelector')
const MapBuilder = require('./MapBuilder')

const ko = require('knockout')

const AccommodationListing = function () {
  const self = this

  const buildInfoWindowMarkup = (p) => {
    return `<div class="map-info-window">
        <h1 class="h2">${p.name()}</h1>
      </div>`
  }

  self.map = new MapBuilder()
  self.items = ko.observableArray()
  self.hasItems = ko.computed(() => self.items().length > 0, self)
  self.selectedTypeFilterName = ko.observable()
  self.typeFilters = ko.observableArray()
  self.dataIsLoaded = ko.observable(false)

  self.markerClicked = (mapIndex) => {
    self.items()
      .forEach((item) => {
        item.isActive(item.mapIndex() === mapIndex)
      })
  }

  self.init = (items) => {
    self.items(items)
    locationSelector
      .getPreviouslySetPostcode()
      .then((currentLocation) => {
        self.map.init(self.items(), currentLocation, self, buildInfoWindowMarkup)
      })
  }
}

module.exports = AccommodationListing
