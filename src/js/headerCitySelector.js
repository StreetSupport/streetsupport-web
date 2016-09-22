const LocationSelector = require('./locationSelector')
const location = new LocationSelector()
const ko = require('knockout')
const SupportedCities = require('./supportedCities')
const supportedCities = new SupportedCities()

var Model = function () {
  const self = this
  let locations = supportedCities.locations
  self.cities = ko.observableArray(locations)
  self.selectedCity = ko.observable()
}

const init = () => {
  location
    .getCurrent()
    .then((result) => {
      model.selectedCity(result.id)
    }, (_) => {

    })
  let model = new Model()
  ko.applyBindings(model, document.getElementById('js-global-city-selector'))
  location.handler(() => {
  })
}

module.exports = {
  init: init
}
