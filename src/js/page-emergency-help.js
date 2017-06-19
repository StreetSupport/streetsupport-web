import './common'

const browser = require('./browser')
const locationSelector = require('./location/locationSelector')
const getApiData = require('./get-api-data')
const apiRoutes = require('./api')
const templating = require('./template-render')

const locationid = locationSelector.getSelectedLocationId()
if (window.location.href.indexOf(locationid) === -1) {
  browser.redirect('/' + locationid + '/emergency-help/')
}

getApiData
  .data(apiRoutes.cities)
  .then((result) => {
    const city = result.data.find((c) => c.id === locationid)

    const callback = () => {
    }
    templating.renderTemplate('js-swep-tpl', city, 'js-swep-output', callback)
  }, (_) => {})
