const location = require('../location/locationSelector')
const supportedCities = require('../location/supportedCities')

import { redirectTo } from './location-redirector'

var Model = function () {
  const self = this
  self.cities = supportedCities.locations
    .filter((c) => c.isPublic)
  self.selectedCity = ''
}

const init = () => {
  const selectedCityId = location.getSelectedLocationId()
  let model = new Model()
  model.selectedCity = selectedCityId

  let body = document.querySelector('body')
  body.classList.add(selectedCityId)

  let locationSelector = document.querySelector('.js-global-city-selector select')
  for (var i = 0; i < model.cities.length; i++) {
    let option = document.createElement('option')
    option.setAttribute('value', model.cities[i].id)
    option.innerHTML = 'I\'m in ' + model.cities[i].name
    if (model.cities[i].id === model.selectedCity) {
      option.setAttribute('selected', 'selected')
    }
    locationSelector.appendChild(option)
  }
  location.handler((selectedLocation) => {
    redirectTo(selectedLocation)
  })
}

module.exports = {
  init: init
}
