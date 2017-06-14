import '../../../common'

const apiRoutes = require('../../../api')
const browser = require('../../../browser')
const getApiData = require('../../../get-api-data')
const getUrlParams = require('../../../get-url-parameter')
import listToSelect from '../../../list-to-dropdown'
const locationSelector = require('../../../location/locationSelector')
const templating = require('../../../template-render')

import { formatNeeds } from '../../../models/give-help/requests/needs'
import { buildList, initAutoComplete } from '../../../models/give-help/requests/listing'

const onChangeLocation = function () {
  browser.redirect('/give-help/help/?my-location')
}

const openIfCardRequested = () => {
  const cardId = getUrlParams.parameter('id').replace('/', '')
  if (cardId) {
    browser.redirect(`request?id=${cardId}`)
  }
}

const renderNeeds = (needs, userLocation) => {
  const theData = {
    card: needs,
    location: userLocation.name,
    geoLocationUnavailable: userLocation.geoLocationUnavailable
  }

  const defaultCallback = () => {
    locationSelector.handler(onChangeLocation)
    browser.loaded()
  }

  if (needs.length === 0) {
    templating.renderTemplate('js-no-data-tpl', theData, 'js-card-list-output', defaultCallback)
  } else {
    templating.renderTemplate('js-card-list-tpl', theData, 'js-card-list-output', () => {
      buildList()
      openIfCardRequested()
      listToSelect.init()
      initAutoComplete(needs)
      defaultCallback()
    })
  }
}

const init = function (userLocation) {
  const url = `${apiRoutes.needsHAL}?longitude=${userLocation.longitude}&latitude=${userLocation.latitude}&limit=100`
  getApiData.data(url)
    .then((result) => {
      const formatted = formatNeeds(result.data.items, userLocation)
      renderNeeds(formatted, userLocation)
    }, () => {
      browser.redirect('/500')
    })
}

browser.loading()
locationSelector
  .getCurrent()
  .then((result) => {
    init(result)
  }, (_) => {

  })
