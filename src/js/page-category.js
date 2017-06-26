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

const onLocationCriteriaChange = (range, postcode) => {
  browser.loading()
  locationSelector.setPostcode(postcode, (result) => {
    renderListing(buildFindHelpUrl(result, range), result)
  }, (_) => {
    browser.loaded()
    window.alert('Sorry, we couldn`t find that postcode. Please try an alternative one.')
  })
}

const hasProvidersCallback = () => {
  accordion.init(true, 0, findHelp.buildListener('category', 'service-provider'), true)

  const reqSubCat = querystring.parameter('sub-category')
  Array.from(document.querySelectorAll('.js-filter-item'))
    .forEach((item) => {
      item.addEventListener('click', changeSubCatFilter)
      if (item.getAttribute('data-id') === reqSubCat) {
        changeSubCatFilter({target: item})
      }
    })

  listToDropdown.init(initDropdownChangeHandler)

  defaultOnRenderListingCallback()
}

const defaultOnRenderListingCallback = () => {
  findHelp.initFindHelpPostcodesLocationSelector(onLocationCriteriaChange)
  browser.initPrint()
  browser.loaded()
  socialShare.init()
  analytics.init(document.title)
}

const initDropdownChangeHandler = () => {
  const dropdown = document.querySelector('.list-to-dropdown__select')
  const filterItems = document.querySelector('.js-filter-item.on')
  dropdown.value = filterItems.innerText
  dropdown.addEventListener('change', dropdownChangeHandler)
}

const getTemplate = (providers) => {
  return providers.length > 0
  ? 'js-category-result-tpl'
  : 'js-category-no-results-result-tpl'
}

const getOnRenderCallback = (providers) => {
  return providers.length > 0
  ? () => hasProvidersCallback()
  : () => defaultOnRenderListingCallback()
}

const getViewModel = (providers, category, locationResult) => {
  const formattedProviders = getProvidersForListing(providers)
  return {
    organisations: formattedProviders,
    subCategories: getSubCategories(providers),
    shouldShowFilter: `${formattedProviders.length > 1}`,
    categoryId: category.id,
    categoryName: category.name,
    categorySynopsis: marked(category.synopsis),
    location: locationResult.name,
    postcode: locationResult.postcode,
    nearestSupportedId: locationResult.nearestSupported !== undefined ? locationResult.nearestSupported.id : '',
    nearestSupportedName: locationResult.nearestSupported !== undefined ? locationResult.nearestSupported.name : '',
    selectedRange: querystring.parameter('range'),
    geoLocationUnavailable: locationResult.geoLocationUnavailable !== undefined
      ? locationResult.geoLocationUnavailable
      : false
  }
}

function renderListing (url, locationResult) {
  getApiData.data(url)
  .then(function (result) {
    if (result.status === 'error') {
      window.location.replace('/find-help/')
    }

    const template = getTemplate(result.data.providers)
    const onRenderCallback = getOnRenderCallback(result.data.providers)
    const viewModel = getViewModel(result.data.providers, result.data.category, locationResult)

    templating.renderTemplate(template, viewModel, 'js-category-result-output', onRenderCallback)
  })
}

const init = (locationResult) => {
  findHelp = new FindHelp(locationResult.findHelpId)
  findHelp.setUrl('category', 'sub-category', querystring.parameter('sub-category'))

  renderListing(buildFindHelpUrl(locationResult), locationResult)
}

browser.loading()

locationSelector
  .getPreviouslySetPostcode()
  .then((result) => {
    init(result)
  })
