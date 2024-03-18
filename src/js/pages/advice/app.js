import '../../common'

const browser = require('../../browser')
const location = require('../../location/locationSelector')
const supportedCities = require('../../location/supportedCities')
const templating = require('../../template-render')

const GetFaqs = require('../../models/faqs/app')

const redirectToHubPage = function (locationId) {
  location.setCurrent(locationId)
  browser.redirect(`/${locationId}/advice`)
}

const init = () => {
  // TODO: remove this console message after testing
  console.log('advice')
  const theData = {
    locations: [{ id: '', name: '- Select a location -' }, ...supportedCities.locations]
  }
  const callback = function () {
    document.querySelector('.js-change-location-select').value = location.getSelectedLocationId()

    location.handler((result) => {
      if (result.length) {
        redirectToHubPage(result)
      }
    }, '.js-change-location-select')

    document.querySelector('.js-change-location-btn')
      .addEventListener('click', (e) => {
        e.preventDefault()
        const locationId = document.querySelector('.js-change-location-select').value
        if (locationId.length > 0) {
          redirectToHubPage(locationId)
        }
      })
  }

  templating.renderTemplate('js-location-selector-tpl', theData, 'js-location-selector-output', callback)

  GetFaqs('general')
}

init()
