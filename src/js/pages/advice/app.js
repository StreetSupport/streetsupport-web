import '../../common'

const browser = require('../../browser')
const location = require('../../location/locationSelector')
const supportedCities = require('../../location/supportedCities')
const templating = require('../../template-render')

const redirectToHubPage = function (locationId) {
  location.setCurrent(locationId)
  browser.redirect(`/${locationId}/advice`)
}

const init = () => {
  const theData = {
    locations: [{ id: '', name: '- Select a location -' }, ...supportedCities.locations]
  }
  const callback = function () {
    location.handler((result) => {
      if (result.length) {
        redirectToHubPage(result)
      }
    }, '.js-homepage-promo-location-selector')
  }

  templating.renderTemplate('js-location-selector-tpl', theData, 'js-location-selector-output', callback)
}

init()
