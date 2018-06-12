/* global google */

import './common'

const FindHelp = require('./find-help')

const htmlEncode = require('htmlencode')
const marked = require('marked')
marked.setOptions({sanitize: true})

const getApiData = require('./get-api-data')
const querystring = require('./get-url-parameter')
const templating = require('./template-render')
const analytics = require('./analytics')
const browser = require('./browser')
const locationSelector = require('./location/locationSelector')
let findHelp = null

import { buildFindHelpUrl, buildInfoWindowMarkup } from './pages/find-help/by-location/helpers'

const buildMap = (userLocation) => {
  const range = querystring.parameter('range')
  const zoomLevels = {
    '1000': 14,
    '2000': 14,
    '5000': 13,
    '10000': 11,
    '20000': 10
  }
  const centre = {lat: userLocation.latitude, lng: userLocation.longitude}
  return new google.maps.Map(document.querySelector('.js-map'), {
    zoom: zoomLevels[range],
    center: centre
  })
}

window.initMap = () => {}

const displayMap = (providers, userLocation) => {
  const map = buildMap(userLocation)

  const infoWindows = []

  providers
    .forEach((p) => {
      const infoWindow = new google.maps.InfoWindow({
        content: buildInfoWindowMarkup(p)
      })

      infoWindows.push(infoWindow)

      const marker = new google.maps.Marker({
        position: { lat: p.location.latitude, lng: p.location.longitude },
        map: map,
        title: `${htmlEncode.htmlDecode(p.serviceProviderName)}`
      })

      marker.addListener('click', () => {
        infoWindows
          .forEach((w) => w.close())
        infoWindow.open(map, marker)
      })
    })

  const pos = {
    lat: userLocation.latitude,
    lng: userLocation.longitude
  }

  new google.maps.Marker({ // eslint-disable-line
    position: pos,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 3,
      fillColor: 'blue',
      strokeColor: 'blue'
    },
    map: map
  })
}

const getTemplate = (providers) => {
  return providers.length > 0
  ? 'js-category-result-tpl'
  : 'js-category-no-results-result-tpl'
}

const onLocationCriteriaChange = (result, range) => {
  browser.loading()
  buildList(result, range)
}

const hasItemsCallback = (providers, locationResult) => {
  displayMap(providers, locationResult)
  defaultOnRenderCallback()
}

const defaultOnRenderCallback = () => {
  findHelp.initFindHelpPostcodesLocationSelector(onLocationCriteriaChange)
  browser.initPrint()
  browser.loaded()
}

const getOnRenderCallback = (providers, locationResult) => {
  return providers.length > 0
  ? () => hasItemsCallback(providers, locationResult)
  : () => defaultOnRenderCallback()
}

const renderResults = (locationResult, result) => {
  const template = getTemplate(result.data.providers)
  const onRenderCallback = getOnRenderCallback(result.data.providers, locationResult)

  analytics.init(document.title)

  let viewModel = {
    categoryId: result.data.category.id,
    categoryName: result.data.category.name,
    categorySynopsis: marked(result.data.category.synopsis),
    location: locationResult.name,
    postcode: locationResult.postcode,
    nearestSupportedId: locationResult.nearestSupported !== undefined ? locationResult.nearestSupported.id : '',
    nearestSupportedName: locationResult.nearestSupported !== undefined ? locationResult.nearestSupported.name : '',
    selectedRange: querystring.parameter('range'),
    geoLocationUnavailable: locationResult.geoLocationUnavailable
  }
  templating.renderTemplate(template, viewModel, 'js-category-result-output', onRenderCallback)
}

const buildList = (locationResult, range) => {
  getApiData.data(buildFindHelpUrl(locationResult, range))
  .then(function (result) {
    if (result.status === 'error') {
      window.location.replace('/find-help/')
    }
    renderResults(locationResult, result)
  })
}

const init = () => {
  browser.loading()
  locationSelector
    .getPreviouslySetPostcode()
    .then((locationResult) => {
      findHelp = new FindHelp(locationResult.findHelpId)
      findHelp.setUrl('category', 'sub-category', querystring.parameter('sub-category'))
      buildList(locationResult)
    }, (_) => {
    })
}

init()
