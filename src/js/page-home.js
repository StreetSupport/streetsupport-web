import './common'
import 'babel-polyfill'

let location = require('./location/locationSelector')
const templating = require('./template-render')
const browser = require('./browser')
const socialShare = require('./social-share')
const endpoints = require('./api')
const api = require('./get-api-data')
const supportedCities = require('./location/supportedCities')

import { suffixer } from './location/suffixer'

const init = (currentLocation) => {
  api
    .data(endpoints.statistics + currentLocation.id + '/latest')
    .then((stats) => {
      let theData = {
        locations: location.getViewModel(currentLocation),
        statistics: stats.data
      }
      supportedCities.locations
        .forEach((c) => {
          theData[`is${c.id}`] = currentLocation.id === c.id
        })

      var callback = function () {
        location.handler(() => {
          window.location.reload()
        }, '.js-homepage-promo-location-selector')

        suffixer(currentLocation)

        browser.loaded()
        socialShare.init()
      }

      templating.renderTemplate('js-content-tpl', theData, 'js-template-output', callback)
    }, (_) => {
    })

  api
    .data(endpoints.cities)
    .then((result) => {
      const city = result.data.find((c) => c.id === currentLocation.id)
      const callback = () => {}
      templating.renderTemplate('js-swep-tpl', city, 'js-swep-output', callback)
    }, (_) => {})
}

location
  .getCurrent()
  .then((result) => {
    init(result)
  })
