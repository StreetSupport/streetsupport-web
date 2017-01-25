import './common'

const accordion = require('./accordion')
const FindHelp = require('./find-help')
const apiRoutes = require('./api')

const forEach = require('lodash/collection/forEach')
const marked = require('marked')
marked.setOptions({sanitize: true})

const getApiData = require('./get-api-data')
const querystring = require('./get-url-parameter')
const templating = require('./template-render')
const analytics = require('./analytics')
const socialShare = require('./social-share')
const browser = require('./browser')
const listToDropdown = require('./list-to-dropdown')
const locationSelector = require('./location/locationSelector')

import { buildFindHelpUrl, groupOpeningTimes } from './pages/find-help/provider-listing/helpers'

const onChangeLocation = (newLocation) => {
  window.location.href = '/find-help/category?category=' + findHelp.theCategory + '&location=' + newLocation
}

let filterItems = null
let providerItems = null
let findHelp = null
let currentLocation = null

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

function buildList (url) {
  getApiData.data(url)
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

      forEach(result.data.providers, function (provider) {
        provider.location.locationDescription = provider.locationDescription
        let service = {
          info: provider.info,
          location: provider.location,
          days: groupOpeningTimes(provider.openingTimes),
          servicesAvailable: provider.subCategories
            .map((sc) => sc.name)
            .join(', ')
        }
        let match = formattedProviders.filter((p) => p.providerId === provider.serviceProviderId)

        if (match.length === 1) {
          match[0].services.push(service)
          match[0].subCategories = match[0].subCategories.concat(provider.subCategories)
        } else {
          let newProvider = {
            providerId: provider.serviceProviderId,
            providerName: provider.serviceProviderName,
            services: [service]
          }
          if (provider.tags !== null) {
            newProvider.tags = provider.tags.join(', ')
          }
          if (provider.subCategories !== null) {
            forEach(provider.subCategories, (sc) => {
              if (subCategories.filter((esc) => esc.id === sc.id).length === 0) {
                subCategories.push(sc)
              }
            })

            newProvider.subCategories = provider.subCategories
          }
          formattedProviders.push(newProvider)
        }
      })
      onRenderCallback = function () {
        accordion.init(true, 0, findHelp.buildListener('category', 'service-provider'), true)

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

        browser.loaded()
        socialShare.init()
      }
    } else {
      template = 'js-category-no-results-result-tpl'
    }

    analytics.init(theTitle)

    let viewModel = {
      organisations: formattedProviders,
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

const init = () => {
  browser.loading()
  locationSelector
    .getCurrent()
    .then((locationResult) => {
      currentLocation = locationResult
      findHelp = new FindHelp(locationResult.findHelpId)
      findHelp.setUrl('category', 'sub-category', querystring.parameter('sub-category'))

      buildList(buildFindHelpUrl(locationResult))
    }, (_) => {
    })
}

init()
