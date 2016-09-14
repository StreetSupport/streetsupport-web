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
  let location = querystring.parameter('location')
  getApiData.data(apiRoutes.serviceProviders + location)
    .then(function (result) {
      let sorted = sortBy(result.data, function (provider) {
        return provider.name.toLowerCase()
      })

      let locationViewModel = locationSelector.getViewModelAll(currentLocation)
      let theData = {
        organisations: sorted,
        locations: locationViewModel
      }

      let callback = function () {
        locationSelector.handler(onChangeLocation)
        browser.loaded()
      }

      templating.renderTemplate('js-category-result-tpl', theData, 'js-category-result-output', callback)
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
