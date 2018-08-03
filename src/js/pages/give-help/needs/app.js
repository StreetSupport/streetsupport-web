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
import Hogan from 'hogan.js'

const redirectForLegacyNeedDetails = () => {
  const cardId = getUrlParams.parameter('id').replace('/', '')
  if (cardId) {
    browser.redirect(`request?id=${cardId}`)
  }
}

const defaultCallback = (currRange) => {
  new PostcodeProximity(currRange, (newLocationResult, newRange) => { //eslint-disable-line
    browser.loading()
    init(newLocationResult, newRange)
  })
  browser.loaded()
}

const renderNeeds = (needs, userLocation, currRange) => {
  const theData = {
    card: needs,
    location: userLocation.name,
    postcode: userLocation.postcode,
    categoryName: 'requests for help',
    geoLocationUnavailable: userLocation.geoLocationUnavailable
  }

  if (needs.length === 0) {
    templating.renderTemplate('js-no-data-tpl', theData, 'js-card-list-output', () => defaultCallback(currRange))
  } else {
    templating.renderTemplate('js-card-list-tpl', theData, 'js-card-list-output', () => {
      buildList()
      redirectForLegacyNeedDetails()
      listToSelect.init()
      initAutoComplete(needs)
      defaultCallback(currRange)
    })
    templating.renderTemplate(
      'js-show-more-tpl',
      null,
      'js-show-more-btn-output',
      () => defaultCallback(currRange))
  }
}

const initClickEvents = (data) => {
  const clickEvents = [
    {
      selector: 'js-show-more-btn',
      action: () => {
        getApiData.data(apiRoutes.getFullUrl(data.links.next))
          .then((result) => {
            if (result.status === 'notFound') {
              throw new Error({msg: 'page not found'})
            }

            // TODO: if (isError) {
            //   removeError()
            // }

            const needs = formatNeeds(result.data.items, data.userLocation)
            const theData = {
              card: needs,
              location: data.userLocation.name,
              postcode: data.userLocation.postcode,
              categoryName: 'requests for help',
              geoLocationUnavailable: data.userLocation.geoLocationUnavailable
            }
            const links = result.data.links

            var content = Hogan.compile(document.getElementById('js-cards-tpl').innerHTML)
              .render(theData)
            document.querySelector('#js-card-list').innerHTML +=
              content

            buildList()
            redirectForLegacyNeedDetails()
            listToSelect.init()
            initAutoComplete(needs)

            if (links.next !== null) {
              templating.renderTemplate('js-show-more-tpl', null, 'js-show-more-btn-output', () => {})
            }

            const newData = Object.assign(Object.assign({}, data), {links: links})
            initClickEvents(newData)
          }).catch(() => {
            // TODO: appendError()
          })
      }
    }
  ]
  clickEvents
    .forEach((e) => {
      const elem = document.querySelector(`.${e.selector}`)
      if (elem) elem.addEventListener('click', e.action)
    })
}

const init = function (userLocation, range = 10000, pageSize = 21) {
  if (userLocation) {
    const headerData = {
      postcode: userLocation.postcode,
      range: range
    }
    templating.renderTemplate('js-header-tpl', headerData, 'js-header-output', () => { })
    const url = `${apiRoutes.needsHAL}?longitude=${userLocation.longitude}&latitude=${userLocation.latitude}&range=${range}&pageSize=${pageSize}`
    getApiData.data(url)
      .then((result) => {
        const formatted = formatNeeds(result.data.items, userLocation)
        renderNeeds(formatted, userLocation, range)
        initClickEvents({links: result.data.links, userLocation: userLocation, currRange: range})
      }, () => {
        browser.redirect('/500')
      })
  } else {
    const theData = {
      card: [],
      location: 'elsewhere',
      categoryName: 'requests for help',
      geoLocationUnavailable: false
    }
    templating.renderTemplate('js-header-tpl', {}, 'js-header-output', () => { })
    templating.renderTemplate('js-no-data-tpl', theData, 'js-card-list-output', () => defaultCallback(10000))
  }
}

browser.loading()
locationSelector
  .getPreviouslySetPostcode()
  .then((result) => {
    init(result)
  }, (_) => {

  })

  /*
  <!--
  {{> get-help-card
        id=id
        detailsUrl=detailsUrl
        type=type
        donationAmountInPounds=donationAmountInPounds
        description=description
        formattedNeededDate=formattedNeededDate
        creationDate=creationDate
        neededDate=neededDate
        distanceAwayInMetres=distanceAwayInMetres
        keywords=keywords
        serviceProviderName=serviceProviderName
        locationDescription=locationDescription
        }}
-->
  */
