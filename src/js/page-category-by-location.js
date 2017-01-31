/* global google */

import './common'

const FindHelp = require('./find-help')

const marked = require('marked')
marked.setOptions({sanitize: true})

const getApiData = require('./get-api-data')
const querystring = require('./get-url-parameter')
const templating = require('./template-render')
const analytics = require('./analytics')
const socialShare = require('./social-share')
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
    '10000': 11
  }
  const centre = {lat: userLocation.latitude, lng: userLocation.longitude}
  return new google.maps.Map(document.querySelector('.js-map'), {
    zoom: zoomLevels[range],
    center: centre
  })
}

const initMap = (providers, userLocation) => {
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
        title: `${p.serviceProviderName}`
      })

      marker.addListener('click', () => {
        infoWindows
          .forEach((w) => w.close())
        infoWindow.open(map, marker)
      })
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        const myLocation = new google.maps.Marker({
          position: pos,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            fillColor: 'blue',
            strokeColor: 'blue'
          },
          map: map
        });
      }, function() {
      });
    } else {
      // Browser doesn't support Geolocation
    }
}

const getTemplate = (providers) => {
  return providers.length > 0
  ? 'js-category-result-tpl'
  : 'js-category-no-results-result-tpl'
}

const onChangeLocation = (newLocation) => {
  window.location.href = '/find-help/category?category=' + findHelp.theCategory + '&location=' + newLocation
}

const hasItemsCallback = (providers, locationResult) => {
  locationSelector.handler(onChangeLocation)
  findHelp.initFindHelpLocationSelector()
  initMap(providers, locationResult)

  browser.initPrint()

  browser.loaded()
  socialShare.init()
}

const hasNoItemsCallback = () => {
  locationSelector.handler(onChangeLocation)
  findHelp.initFindHelpLocationSelector()
  browser.loaded()
  socialShare.init()
}

const getOnRenderCallback = (providers, locationResult) => {
  return providers.length > 0
  ? () => hasItemsCallback(providers, locationResult)
  : () => hasNoItemsCallback()
}

const renderResults = (locationResult, result) => {
  let theTitle = result.data.category.name + ' - Street Support'
  document.title = theTitle

  const template = getTemplate(result.data.providers)
  const onRenderCallback = getOnRenderCallback(result.data.providers, locationResult)

  analytics.init(theTitle)

  let viewModel = {
    categoryId: result.data.category.id,
    categoryName: result.data.category.name,
    categorySynopsis: marked(result.data.category.synopsis),
    location: locationResult.name
  }
  templating.renderTemplate(template, viewModel, 'js-category-result-output', onRenderCallback)
}

const buildList = (locationResult) => {
  getApiData.data(buildFindHelpUrl(locationResult))
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
    .getCurrent()
    .then((locationResult) => {
      findHelp = new FindHelp(locationResult.findHelpId)
      findHelp.setUrl('category', 'sub-category', querystring.parameter('sub-category'))
      buildList(locationResult)
    }, (_) => {
    })
}

init()