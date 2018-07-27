import './common'

const FindHelp = require('./find-help')

const marked = require('marked')
marked.setOptions({sanitize: true})

const getApiData = require('./get-api-data')
const querystring = require('./get-url-parameter')
const templating = require('./template-render')
const analytics = require('./analytics')
const browser = require('./browser')
const listToDropdown = require('./list-to-dropdown')
const locationSelector = require('./location/locationSelector')
const categories = require('../data/generated/service-categories')

import { buildFindHelpUrl, getProvidersForListing, getSubCategories } from './pages/find-help/provider-listing/helpers'

let findHelp = null

const subCatFilter = {
  selectors: {
    item: '.js-filter-item',
    selectedItem: '.js-filter-item.on',
    asDropdown: '.list-to-dropdown__select'
  }
}

const changeSubCatFilter = (e) => {
  const reqId = e.target.getAttribute('data-id')
  const subCatBtns = Array.from(document.querySelectorAll(subCatFilter.selectors.item))

  const matchingBtn = subCatBtns.find((b) => b.getAttribute('data-id') === reqId)

  if (matchingBtn.classList.contains('on')) return

  subCatBtns
    .forEach((item) => {
      item.classList.remove('on')
    })

  e.target.classList.add('on')

  const providerItems = Array.from(document.querySelectorAll('.js-item, .js-header'))
  providerItems
    .forEach((item) => {
      item.classList.remove('hide')
    })

  if (reqId.length > 0) {
    providerItems
      .forEach((item) => {
        console.log(item.getAttribute('data-subcats'))
        if (item.getAttribute('data-subcats').indexOf(reqId) < 0) {
          item.classList.add('hide')
        }
      })
  }
  findHelp.setUrl('category-by-day', 'sub-category', reqId)
}

const initHistoryBackOnSubcats = () => {
  browser.setOnHistoryPop(() => {
    const subCat = querystring.parameter('sub-category')
    changeSubCatFilter({target: document.querySelector(`[data-id="${subCat}"]`)})
  })
}

const onSubCatDropdownChange = (e) => {
  Array.from(document.querySelectorAll(subCatFilter.selectors.item))
    .forEach((item) => {
      if (item.innerText === e.target.value) {
        changeSubCatFilter({target: item})
      }
    })
}

const initSubCatAsDropdown = () => {
  const dropdown = document.querySelector(subCatFilter.selectors.asDropdown)
  const filterItems = document.querySelector(subCatFilter.selectors.selectedItem)
  dropdown.value = filterItems.innerText
  dropdown.addEventListener('change', onSubCatDropdownChange)
}

const initSubCatFilter = () => {
  const reqSubCat = querystring.parameter('sub-category')
  Array.from(document.querySelectorAll(subCatFilter.selectors.item))
    .forEach((item) => {
      item.addEventListener('click', changeSubCatFilter)
      if (item.getAttribute('data-id') === reqSubCat) {
        changeSubCatFilter({target: item})
      }
    })
  initHistoryBackOnSubcats()
  listToDropdown.init(initSubCatAsDropdown)
}

const hasProvidersCallback = () => {
  initSubCatFilter()

  defaultOnRenderListingCallback()
}

const onLocationCriteriaChange = (newLocationResult, newRange) => {
  browser.loading()
  renderListing(buildFindHelpUrl(newLocationResult, newRange), newLocationResult)
}

const defaultOnRenderListingCallback = () => {
  findHelp.initFindHelpPostcodesLocationSelector(onLocationCriteriaChange)
  browser.loaded()
  analytics.init(document.title)
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
  if (locationResult) {
    findHelp = new FindHelp(locationResult.findHelpId)
    findHelp.setUrl('category', 'sub-category', querystring.parameter('sub-category'))

    renderListing(buildFindHelpUrl(locationResult), locationResult)
  } else {
    const re = new RegExp(/find-help\/(.*)\//)
    const categoryId = browser.location().pathname.match(re)[1]
    const category = categories.categories.find((c) => c.key === categoryId)

    const viewModel = {
      categoryId: category.key,
      categoryName: category.name,
      categorySynopsis: marked(category.synopsis),
      geoLocationUnavailable: false
    }
    findHelp = new FindHelp('elsewhere')
    templating.renderTemplate('js-category-no-results-result-tpl', viewModel, 'js-category-result-output', defaultOnRenderListingCallback)
  }
}

browser.loading()

locationSelector
  .getPreviouslySetPostcode()
  .then((result) => {
    init(result)
  })
