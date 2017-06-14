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
import { displayCard, displayCardNotFound, displayListing } from '../../../models/give-help/requests/page'

const onChangeLocation = function () {
  browser.redirect('/give-help/help/?my-location')
}

const buildDetails = (data) => {
  const openIfCardRequested = () => {
    const cardId = getUrlParams.parameter('id').replace('/', '')
    if (cardId) {
      const card = Array.from(document.querySelectorAll('.requests-listing__item'))
        .find((c) => c.getAttribute('data-id') === cardId)
      if (card) {
        displayCard(card, data.find((n) => n.id === cardId), () => {
          browser.pushHistory({}, 'from openIfCardRequested', '')
          displayListing()
        })
      } else {
        displayCardNotFound()
      }
    }
  }

  const addClickEvents = () => {
    const addEventListener = (card) => {
      card.addEventListener('click', (event) => {
        event.preventDefault()
        displayCard(card, data.find((n) => n.id === card.getAttribute('data-id')), () => browser.popHistory())
      })
    }
    Array.from(document.querySelectorAll('.requests-listing__item'))
      .forEach(addEventListener)
  }

  browser.setOnHistoryPop(() => {
    displayListing()
    openIfCardRequested()
  })

  addClickEvents()
  openIfCardRequested()
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
      buildDetails(needs)
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
