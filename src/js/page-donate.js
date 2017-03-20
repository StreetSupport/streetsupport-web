// Common modules
import './common'

let apiRoutes = require('./api')
let getApiData = require('./get-api-data')
let templating = require('./template-render')
let browser = require('./browser')
let querystring = require('./get-url-parameter')
let locationSelector = require('./location/locationSelector')
let supportedCities = require('./location/supportedCities')
let htmlencode = require('htmlencode')

let currentLocation = null

let onChangeLocation = (newLocation) => {
  window.location.href = '/give-help/donate/?location=' + newLocation
}

let getData = () => {
  if (window.location.search.length === 0) {
    var saved = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*=\s*([^;]*).*$)|^.*$/, '$1')
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
        browser.loaded()
      }
      locationSelector.handler(onChangeLocation)
      let locations = locationSelector.getViewModelAll(currentLocation)
      let theData = {
        location: currentLocation.name,
        locations: locations
      }
      supportedCities.locations
        .forEach((c) => {
          theData[`is${c.id}`] = currentLocation.id === c.id
        })

      if (result.data.length === 0) {
        templating.renderTemplate('js-no-result-tpl', theData, 'js-result-output', callback)
      } else {
        let sorted = result.data.sort(function (a, b) {
          if (a.providerName.toLowerCase() < b.providerName.toLowerCase()) return -1
          if (a.providerName.toLowerCase() > b.providerName.toLowerCase()) return 1
          return 0
        })
        sorted.forEach((p) => {
          p.description = htmlencode.htmlDecode(p.description)
          p.providerName = htmlencode.htmlDecode(p.providerName)
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
