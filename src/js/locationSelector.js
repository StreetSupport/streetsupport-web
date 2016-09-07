let SupportedCities = require('./supportedCities')

let supportedCities = new SupportedCities()

let _getCurrent = () => {
  var saved = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*\=\s*([^;]*).*$)|^.*$/, '$1')
  if (saved.length > 0) return saved
  return supportedCities.default.id
}

let _setCurrent = (newCity) => {
  document.cookie = 'desired-location=' + newCity
}

let locationSelector = {
  getCurrent: _getCurrent,
  viewModel: {
    cities: supportedCities.locations.map((l) => {
      let newLocation = l
      newLocation.isSelected = l.id === _getCurrent()
      return newLocation
    })
  },
  handler: (onChangeLocationCallback) => {
    let locationSelector = document.querySelector('.js-location-select')
    locationSelector.addEventListener('change', () => {
      var selectedLocation = locationSelector.options[locationSelector.selectedIndex].value
      _setCurrent(selectedLocation)
      onChangeLocationCallback(selectedLocation)
    })
  }
}

module.exports = locationSelector
