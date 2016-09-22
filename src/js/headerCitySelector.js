const LocationSelector = require('./locationSelector')
const location = new LocationSelector()
const ko = require('knockout')
const SupportedCities = require('./supportedCities')
const supportedCities = new SupportedCities()

var Model = function () {
  const self = this
  self.cities = ko.observableArray(supportedCities.locations)
  self.selected = ko.observable()
}

const init = () => {
  location
    .getCurrent()
    .then((result) => {
      model.selected(result.id)
    }, (_) => {

    })
  let model = new Model()
  ko.applyBindings(model, document.getElementById('js-global-city-selector'))
  location.handler(() => {
    console.log('handle')
  })
}

module.exports = {
  init: init
}
