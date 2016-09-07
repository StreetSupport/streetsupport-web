let SupportedCities = require('./supportedCities')

let supportedCities = new SupportedCities()

let locationSelector = {
  viewModel: {
    cities: supportedCities.locations.map((l) => {
      let newLocation = l
      newLocation.isSelected = l.id === supportedCities.getCurrent()
      return newLocation
    })
  },
  handler: () => {
    let locationSelector = document.querySelector('.js-location-select')
    locationSelector.addEventListener('change', () => {
      var selectedLocation = locationSelector.options[locationSelector.selectedIndex].value
      supportedCities.setCurrent(selectedLocation)
    })
  }
}

module.exports = locationSelector
