import './common'

let location = require('./location/locationSelector')
const templating = require('./template-render')
const browser = require('./browser')
const socialShare = require('./social-share')
const endpoints = require('./api')
const api = require('./get-api-data')
const supportedCities = require('./location/supportedCities')
const WPAPI = require('wpapi')

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

  // todo: TESTING THE WP API. THIS WILL BE REMOVED
  let apiPromise = WPAPI.discover('https://news.streetsupport.net')
  apiPromise.then(function( site ) {
    // If default routes were detected, they are now available
    site.posts().then(function( posts ) {
      console.log( posts );
    });
  })
}

location
  .getCurrent()
  .then((result) => {
    init(result)
  })
