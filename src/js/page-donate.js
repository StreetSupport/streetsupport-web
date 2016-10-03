// Common modules
import './common'
let sortBy = require('lodash/collection/sortBy')

let apiRoutes = require('./api')
let getApiData = require('./get-api-data')
let templating = require('./template-render')
let browser = require('./browser')
let querystring = require('./get-url-parameter')
let LocationSelector = require('./locationSelector')
let locationSelector = new LocationSelector()

let currentLocation = null

let onChangeLocation = (newLocation) => {
  window.location.href = '/give-help/donate/?location=' + newLocation
}

let getData = () => {
  if (window.location.search.length === 0) {
    var saved = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*\=\s*([^;]*).*$)|^.*$/, '$1')
    if (saved !== undefined && saved.length > 0 && saved !== 'my-location') {
      onChangeLocation(saved)
    }
  }

  let location = querystring.parameter('location')
  let url = apiRoutes.serviceProviders + 'donation-information/'
  if (location.length > 0) {
    url = apiRoutes.serviceProviders + location + '/donation-information/'
  }
  getApiData.data(url)
    .then(function (result) {
      let callback = function () {
        locationSelector.handler(onChangeLocation, '.js-donation-location-selector')
        browser.loaded()
      }
      let locations = locationSelector.getViewModelAll(currentLocation)
      console.log(currentLocation)
      let theData = {
        location: currentLocation.name,
        isManchester: location === 'manchester',
        locations: locations
      }

      if (result.data.length === 0) {
        templating.renderTemplate('js-no-result-tpl', theData, 'js-result-output', callback)
      } else {
        let sorted = sortBy(result.data, function (provider) {
          return provider.providerName.toLowerCase()
        })

        theData.organisations = sorted
        templating.renderTemplate('js-result-tpl', theData, 'js-result-output', callback)
      }
    })
}

let init = () => {
  browser.loading()
  locationSelector
    .getCurrent()
    .then((result) => {
      currentLocation = result
      getData()
    })
}

init()
