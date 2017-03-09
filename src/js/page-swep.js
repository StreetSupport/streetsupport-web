import './common'
import 'babel-polyfill'

const browser = require('./browser')
const locationSelector = require('./location/locationSelector')
const getApiData = require('./get-api-data')
const apiRoutes = require('./api')
const templating = require('./template-render')

locationSelector
  .getCurrent()
  .then((location) => {
    if (window.location.href.indexOf(location.id) === -1) {
      browser.redirect('/' + location.id + '/severe-weather-accommodation/')
    }

    getApiData
      .data(apiRoutes.cities)
      .then((result) => {
        const city = result.data.find((c) => c.id === location.id)

        const callback = () => {
        }
        templating.renderTemplate('js-swep-tpl', city, 'js-swep-output', callback)
      }, (_) => {})
  })
