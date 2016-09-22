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
  window.location.href = '/find-help/all-service-providers/?location=' + newLocation
}

let getData = () => {
  if (window.location.search.length === 0) {
    var saved = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*\=\s*([^;]*).*$)|^.*$/, '$1')
    if (saved !== undefined && saved.length > 0 && saved !== 'my-location') {
      onChangeLocation(saved)
    }
  }

  let location = querystring.parameter('location')

  getApiData.data(apiRoutes.serviceProviders + location)
    .then(function (result) {
      let callback = function () {
        locationSelector.handler(onChangeLocation)
        browser.loaded()
      }
      if (result.data.length === 0) {
        let theData = {
          location: currentLocation.name
        }
        templating.renderTemplate('js-category-no-result-tpl', theData, 'js-category-result-output', callback)
      } else {
        let sorted = sortBy(result.data, function (provider) {
          return provider.name.toLowerCase()
        })

        let theData = {
          organisations: sorted,
          location: currentLocation.name
        }

        templating.renderTemplate('js-category-result-tpl', theData, 'js-category-result-output', callback)
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
