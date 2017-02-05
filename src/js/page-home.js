import './common'
import 'babel-polyfill'

let location = require('./location/locationSelector')
const templating = require('./template-render')
const browser = require('./browser')
const socialShare = require('./social-share')
const endpoints = require('./api')
const api = require('./get-api-data')

const init = (result) => {
  const cityId = result.id
  const cityLabel = result.id === 'manchester'
    ? 'Manchester'
    : 'Leeds'

  api
    .data(endpoints.statistics + result.id + '/latest')
    .then((stats) => {
      let theData = {
        isManchester: result.id === 'manchester',
        isLeeds: result.id === 'leeds',
        locations: location.getViewModel(result),
        statistics: stats.data
      }

      var callback = function () {
        location.handler(() => {
          window.location.reload()
        }, '.js-homepage-promo-location-selector')

        document.querySelector('.js-city-label')
          .innerHTML = 'in ' + cityLabel

        browser.loaded()
        socialShare.init()
      }

      templating.renderTemplate('js-content-tpl', theData, 'js-template-output', callback)
    }, (_) => {
    })

  api
    .data(endpoints.cities)
    .then((result) => {
      const city = result.data.find((c) => c.id === cityId)
      const callback = () => {}
      templating.renderTemplate('js-swep-tpl', city, 'js-swep-output', callback)
    }, (_) => {})
}

location
  .getCurrent()
  .then((result) => {
    init(result)
  })
