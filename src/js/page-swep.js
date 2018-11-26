import './common'

const locationSelector = require('./location/locationSelector')
const getApiData = require('./get-api-data')
const apiRoutes = require('./api')
const templating = require('./template-render')

const locationId = locationSelector.getCurrentHub()

getApiData
  .data(apiRoutes.cities)
  .then((result) => {
    const city = result.data.find((c) => c.id === locationId)

    const callback = () => {
    }
    templating.renderTemplate('js-swep-tpl', city, 'js-swep-output', callback)
  }, (_) => {})
