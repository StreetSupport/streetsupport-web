/* global google */

import './common'

let FindHelp = require('./find-help')
let apiRoutes = require('./api')

let forEach = require('lodash/collection/forEach')
let marked = require('marked')
marked.setOptions({sanitize: true})
let htmlEncode = require('htmlencode')

let getApiData = require('./get-api-data')
let querystring = require('./get-url-parameter')
let templating = require('./template-render')
let analytics = require('./analytics')
let socialShare = require('./social-share')
let browser = require('./browser')
let listToDropdown = require('./list-to-dropdown')
let locationSelector = require('./location/locationSelector')
let findHelp = null
let currentLocation = null

let onChangeLocation = (newLocation) => {
  window.location.href = '/find-help/category?category=' + findHelp.theCategory + '&location=' + newLocation
}

let filterItems = null
let providerItems = null

let changeSubCatFilter = (e) => {
  forEach(document.querySelectorAll('.js-filter-item'), (item) => {
    item.classList.remove('on')
  })

  e.target.classList.add('on')

  forEach(providerItems, (item) => {
    item.classList.remove('hide')
  })

  let id = e.target.getAttribute('data-id')
  if (id.length > 0) {
    forEach(providerItems, (item) => {
      if (item.getAttribute('data-subcats').indexOf(id) < 0) {
        item.classList.add('hide')
      }
    })
  }
  findHelp.setUrl('category-by-day', 'sub-category', id)
}

let dropdownChangeHandler = (e) => {
  forEach(filterItems, (item) => {
    if (item.innerText === e.target.value) {
      changeSubCatFilter({target: item})
    }
  })
}

let initDropdownChangeHandler = () => {
  let dropdown = document.querySelector('.list-to-dropdown__select')
  let filterItems = document.querySelector('.js-filter-item.on')
  dropdown.value = filterItems.innerText
  dropdown.addEventListener('change', dropdownChangeHandler)
}

const buildFindHelpUrl = (locationResult) => {
  const category = querystring.parameter('category')
  const location = querystring.parameter('location')
  const range = querystring.parameter('range')

  let url = apiRoutes.cities + locationResult.findHelpId + '/services/' + findHelp.theCategory
  if (location === 'my-location') {
    url = apiRoutes.servicesByCategory + category + '/' + locationResult.latitude + '/' + locationResult.longitude
  }
  url += '?range=' + range

  return url
}

const initMap = (providers, userLocation) => {
  const range = querystring.parameter('range')
  const zoomLevels = {
    '1000': 14,
    '2000': 14,
    '5000': 13,
    '10000': 11
  }
  const centre = {lat: userLocation.latitude, lng: userLocation.longitude}
  const map = new google.maps.Map(document.querySelector('.js-map'), {
    zoom: zoomLevels[range],
    center: centre
  })

  const infoWindows = []

  providers
    .forEach((p) => {
      let previousDay = ''
      const timeMarkup = p.openingTimes
        .map((ot) => {
          const titleClass = ot.day !== previousDay
            ? ''
            : 'hide-screen'
          previousDay = ot.day
          return `<dt class="map-info-window__opening-times-day ${titleClass}">${ot.day}</dt>
            <dd class="map-info-window__opening-times-time">${ot.startTime} - ${ot.endTime}</dd>`
        })
        .join('')
      const suitableForMarkup = p.tags.length > 0
      ? `<p>Suitable for: ${p.tags.join(', ')}</p>`
      : ''

      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="map-info-window">
          <h1 class="h2"><a href="/find-help/organisation/?organisation=${p.serviceProviderId}">${p.serviceProviderName}</a></h1>
          ${suitableForMarkup}
          <p>${htmlEncode.htmlDecode(p.info)}</p>
          <dl class="map-info-window__opening-times">${timeMarkup}</dl>
          <a href="/find-help/organisation/?organisation=${p.serviceProviderId}" class="btn btn--brand-e">
            <span class="btn__text">More about ${p.serviceProviderName}</span>
          </a>
        </div>`
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
}

const buildList = (locationResult) => {
  getApiData.data(buildFindHelpUrl(locationResult))
  .then(function (result) {
    if (result.status === 'error') {
      window.location.replace('/find-help/')
    }
    let theTitle = result.data.category.name + ' - Street Support'
    document.title = theTitle

    let template = ''
    let onRenderCallback = function () {
      listToDropdown.init()
      locationSelector.handler(onChangeLocation)
      findHelp.initFindHelpLocationSelector()
      browser.loaded()
      socialShare.init()
    }

    let formattedProviders = []
    let subCategories = []

    if (result.data.providers.length > 0) {
      template = 'js-category-result-tpl'

      onRenderCallback = () => {
        providerItems = document.querySelectorAll('.js-item, .js-header')
        filterItems = document.querySelectorAll('.js-filter-item')

        forEach(filterItems, (item) => {
          item.addEventListener('click', changeSubCatFilter)
        })

        let reqSubCat = querystring.parameter('sub-category')
        forEach(filterItems, (item) => {
          if (item.getAttribute('data-id') === reqSubCat) {
            changeSubCatFilter({target: item})
          }
        })
        locationSelector.handler(onChangeLocation)
        listToDropdown.init(initDropdownChangeHandler)

        findHelp.initFindHelpLocationSelector()

        initMap(result.data.providers, locationResult)

        browser.loaded()
        socialShare.init()
      }
    } else {
      template = 'js-category-no-results-result-tpl'
    }

    analytics.init(theTitle)

    let viewModel = {
      subCategories: subCategories,
      shouldShowFilter: '' + formattedProviders.length > 1,
      categoryId: result.data.category.id,
      categoryName: result.data.category.name,
      categorySynopsis: marked(result.data.category.synopsis),
      location: currentLocation.name
    }
    templating.renderTemplate(template, viewModel, 'js-category-result-output', onRenderCallback)
  })
}

browser.loading()
locationSelector
  .getCurrent()
  .then((result) => {
    currentLocation = result
    findHelp = new FindHelp(result.findHelpId)
    let reqSubCat = querystring.parameter('sub-category')
    findHelp.setUrl('category', 'sub-category', reqSubCat)
    buildList(result)
  }, (_) => {
  })
