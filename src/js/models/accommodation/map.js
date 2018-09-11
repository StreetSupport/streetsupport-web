const locationSelector = require('../../location/locationSelector')
const MapBuilder = require('./MapBuilder')

const ko = require('knockout')
const htmlEncode = require('htmlencode')

const AccommodationListing = function () {
  const self = this

  const buildInfoWindowMarkup = (p) => {
    return `<div class="card card--brand-h card--gmaps">
              <div class="card__title">
                <button class="card__close js-popup-close" title="close">&#10799;</button>
                <h1 class="h2">${htmlEncode.htmlDecode(p.name())}</h1>
                <p>${htmlEncode.htmlDecode(p.synopsis())}
              </div>
              <div class="card__details">
                <a href="${p.detailsUrl()}">View details</a>
              </div>
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
