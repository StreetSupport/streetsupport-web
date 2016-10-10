const location = require('../location/locationSelector')
const supportedCities = require('../location/supportedCities')
const browser = require('../browser')
const cityPageRedirects = require('./cityPageRedirects')

var Model = function () {
  const self = this
  self.cities = supportedCities.locations
  self.selectedCity = ''
}

const init = () => {
  location
    .getCurrent()
    .then((result) => {
      let model = new Model()
      model.selectedCity = result.id

      let body = document.querySelector('body')
      body.classList.add(result.id)

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
        let pathname = window.location.pathname
        if (cityPageRedirects.hasOwnProperty(pathname)) {
          browser.redirect(cityPageRedirects[pathname])
        } else {
          window.location.reload()
        }
      })
    }, (_) => {
    })
}

module.exports = {
  init: init
}
