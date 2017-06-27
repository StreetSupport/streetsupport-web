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

const openIfCardRequested = () => {
  const cardId = getUrlParams.parameter('id').replace('/', '')
  if (cardId) {
    browser.redirect(`request?id=${cardId}`)
  }
}

const setRange = (newValue) => {
  const range = document.querySelector('.js-find-help-range')
  Array.from(range.children)
    .forEach((c) => {
      if (parseInt(c.value) === parseInt(newValue)) {
        c.setAttribute('selected', 'selected')
      }
    })
}

const initSearchForm = (currRange) => {
  setRange(currRange)
  const updateSearchButton = document.querySelector('.js-update-search')
  const locationSearchPostcode = document.querySelector('.js-location-search-postcode')
  const range = document.querySelector('.js-find-help-range')
  updateSearchButton.addEventListener('click', (e) => {
    e.preventDefault()
    browser.loading()
    const rangeVal = range.value
    const postcodeValue = locationSearchPostcode.value
    locationSelector.setPostcode(postcodeValue, (newLocationResult) => {
      init(newLocationResult, rangeVal)
    })
  }, () => {
    console.log('error')
  })
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
    initSearchForm(currRange)
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
