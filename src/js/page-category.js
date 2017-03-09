import './common'

const accordion = require('./accordion')
const FindHelp = require('./find-help')

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

import { buildFindHelpUrl, getProvidersForListing, getSubCategories } from './pages/find-help/provider-listing/helpers'

const onChangeLocation = (newLocation) => {
  window.location.href = `/find-help/${findHelp.theCategory}?location=${newLocation}`
}

let findHelp = null

const changeSubCatFilter = (e) => {
  Array.from(document.querySelectorAll('.js-filter-item'))
    .forEach((item) => {
      item.classList.remove('on')
    })

  e.target.classList.add('on')

  const providerItems = Array.from(document.querySelectorAll('.js-item, .js-header'))
  providerItems
    .forEach((item) => {
      item.classList.remove('hide')
    })

  const id = e.target.getAttribute('data-id')
  if (id.length > 0) {
    providerItems
      .forEach((item) => {
        if (item.getAttribute('data-subcats').indexOf(id) < 0) {
          item.classList.add('hide')
        }
      })
  }
  findHelp.setUrl('category-by-day', 'sub-category', id)
}

const dropdownChangeHandler = (e) => {
  Array.from(document.querySelectorAll('.js-filter-item'))
    .forEach((item) => {
      if (item.innerText === e.target.value) {
        changeSubCatFilter({target: item})
      }
    })
}

const getTemplate = (providers) => {
  return providers.length > 0
  ? 'js-category-result-tpl'
  : 'js-category-no-results-result-tpl'
}

const hasProvidersCallback = () => {
  accordion.init(true, 0, findHelp.buildListener('category', 'service-provider'), true)

  const filterItems = Array.from(document.querySelectorAll('.js-filter-item'))

  filterItems
    .forEach((item) => {
      item.addEventListener('click', changeSubCatFilter)
    })

  const reqSubCat = querystring.parameter('sub-category')
  filterItems
    .forEach((item) => {
      if (item.getAttribute('data-id') === reqSubCat) {
        changeSubCatFilter({target: item})
      }
    })

  locationSelector.handler(onChangeLocation)
  listToDropdown.init(initDropdownChangeHandler)
  findHelp.initFindHelpLocationSelector()

  browser.initPrint()

  browser.loaded()
  socialShare.init()
}

const hasNoProvidersCallback = () => {
  listToDropdown.init()
  locationSelector.handler(onChangeLocation)
  findHelp.initFindHelpLocationSelector()
  browser.initPrint()
  browser.loaded()
  socialShare.init()
}

const getCallback = (providers) => {
  return providers.length > 0
  ? () => hasProvidersCallback()
  : () => hasNoProvidersCallback()
}

const initDropdownChangeHandler = () => {
  const dropdown = document.querySelector('.list-to-dropdown__select')
  const filterItems = document.querySelector('.js-filter-item.on')
  dropdown.value = filterItems.innerText
  dropdown.addEventListener('change', dropdownChangeHandler)
}

function buildList (url, locationResult) {
  getApiData.data(url)
  .then(function (result) {
    if (result.status === 'error') {
      window.location.replace('/find-help/')
    }
    analytics.init(document.title)

    const template = getTemplate(result.data.providers)
    const onRenderCallback = getCallback(result.data.providers)

    const formattedProviders = getProvidersForListing(result.data.providers)

    const viewModel = {
      organisations: formattedProviders,
      subCategories: getSubCategories(result.data.providers),
      shouldShowFilter: '' + formattedProviders.length > 1,
      categoryId: result.data.category.id,
      categoryName: result.data.category.name,
      categorySynopsis: marked(result.data.category.synopsis),
      location: locationResult.name,
      geoLocationUnavailable: locationResult.geoLocationUnavailable !== undefined
        ? locationResult.geoLocationUnavailable
        : false
    }
    templating.renderTemplate(template, viewModel, 'js-category-result-output', onRenderCallback)
  })
}

const init = () => {
  browser.loading()
  locationSelector
    .getCurrent()
    .then((locationResult) => {
      findHelp = new FindHelp(locationResult.findHelpId)
      findHelp.setUrl('category', 'sub-category', querystring.parameter('sub-category'))

      buildList(buildFindHelpUrl(locationResult), locationResult)
    }, (_) => {
    })
}

init()
