/* global google */

import './common'

const FindHelp = require('./find-help')

const htmlEncode = require('htmlencode')
const marked = require('marked')
marked.setOptions({ sanitize: true })

const analytics = require('./analytics')
const browser = require('./browser')
const categories = require('../data/generated/service-categories')
const getApiData = require('./get-api-data')
const googleMaps = require('./location/googleMaps')
const locationSelector = require('./location/locationSelector')
const proximityRanges = require('./location/proximityRanges')
const querystring = require('./get-url-parameter')
const templating = require('./template-render')
let findHelp = null

import { buildFindHelpUrl, buildInfoWindowMarkup } from './pages/find-help/by-location/helpers'

const buildMap = (userLocation) => {
  const zoom = proximityRanges.getByRange(querystring.parameter('range'))
  const center = { lat: userLocation.latitude, lng: userLocation.longitude }

  return googleMaps.buildMap(userLocation, { zoom, center })
}

window.initMap = () => { }

const displayMap = (providers, userLocation) => {
  const map = buildMap(userLocation)

  let popup = null

  providers
    .forEach((p) => {
      const marker = googleMaps.buildMarker(p.location, map, { title: `${htmlEncode.htmlDecode(p.serviceProviderName)}` })

      marker.addListener('click', function () {
        document.querySelectorAll('.card__gmaps-container')
          .forEach((p) => p.parentNode.removeChild(p))
          const position = new google.maps.LatLng(this.position.lat(), this.position.lng())
          popup = new googleMaps.Popup(
          position,
          buildInfoWindowMarkup(p))
        popup.setMap(map)
        map.setCenter(position)
      })
    })

  googleMaps.addCircleMarker(userLocation, map)
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
      if (locationResult) {
        findHelp = new FindHelp(locationResult.findHelpId)
        findHelp.setUrl('category', 'sub-category', querystring.parameter('sub-category'))
        buildList(locationResult)
      } else {
        findHelp = new FindHelp('elsewhere')
        const re = new RegExp(/find-help\/(.*)\//)
        const categoryId = browser.location().pathname.match(re)[1].split('/')[0]
        const category = categories.categories.find((c) => c.key === categoryId)

        const viewModel = {
          categoryId: category.key,
          categoryName: category.name,
          categorySynopsis: marked(category.synopsis),
          geoLocationUnavailable: false
        }
        templating.renderTemplate('js-category-no-results-result-tpl', viewModel, 'js-category-result-output', defaultOnRenderCallback)
      }
    }, (_) => {
    })
}

init()
