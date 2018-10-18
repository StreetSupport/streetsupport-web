const location = require('../location/locationSelector')
const supportedCities = require('../location/supportedCities')

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

  if (Array.from(body.classList).includes(`location--`)) {
    body.classList.add(`location--${selectedCityId}`)
  }
}

module.exports = {
  init: init
}
