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
import { PostcodeProximity } from '../../../components/PostcodeProximity'

const openIfCardRequested = () => {
  const cardId = getUrlParams.parameter('id').replace('/', '')
  if (cardId) {
    browser.redirect(`request?id=${cardId}`)
  }
}

const renderNeeds = (needs, userLocation, currRange) => {
  const theData = {
    card: needs,
    location: userLocation.name,
    postcode: userLocation.postcode,
    categoryName: 'requests for help',
    geoLocationUnavailable: userLocation.geoLocationUnavailable
  }

  const defaultCallback = () => {
    const postcodeProximityComponent = new PostcodeProximity(currRange, (newLocationResult, newRange) => { //eslint-disable-line
      init(newLocationResult, newRange)
    })
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

const init = function (userLocation, range = 10000) {
  const url = `${apiRoutes.needsHAL}?longitude=${userLocation.longitude}&latitude=${userLocation.latitude}&range=${range}&limit=100`
  getApiData.data(url)
    .then((result) => {
      const formatted = formatNeeds(result.data.items, userLocation)
      renderNeeds(formatted, userLocation, range)
    }, () => {
      browser.redirect('/500')
    })
}

browser.loading()
locationSelector
  .getPreviouslySetPostcode()
  .then((result) => {
    init(result)
  }, (_) => {

  })
