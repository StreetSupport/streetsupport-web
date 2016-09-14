import './common'

let accordion = require('./accordion')
let FindHelp = require('./find-help')
let apiRoutes = require('./api')

let forEach = require('lodash/collection/forEach')
let marked = require('marked')

let getApiData = require('./get-api-data')
let querystring = require('./get-url-parameter')
let templating = require('./template-render')
let analytics = require('./analytics')
let socialShare = require('./social-share')
let browser = require('./browser')
let listToDropdown = require('./list-to-dropdown')
let LocationSelector = require('./locationSelector')
let locationSelector = new LocationSelector()
let findHelp = null
let currentLocation = null

let onChangeLocation = (newLocation) => {
  window.location.href = '/find-help/category?category=' + findHelp.theCategory + '&location=' + newLocation
}

let groupOpeningTimes = (ungrouped) => {
  let grouped = []
  for (let i = 0; i < ungrouped.length; i++) {
    let curr = ungrouped[i]
    let sameDay = grouped.filter((d) => d.day === curr.day)
    if (sameDay.length === 0) {
      grouped.push({
        day: curr.day,
        openingTimes: [curr.startTime + '-' + curr.endTime]
      })
    } else {
      sameDay[0].openingTimes.push(curr.startTime + '-' + curr.endTime)
    }
  }
  return grouped
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
      browser.loaded()
      socialShare.init()
    }

    let formattedProviders = []
    let subCategories = []

    if (result.data.providers.length > 0) {
      template = 'js-category-result-tpl'

      forEach(result.data.providers, function (provider) {
        let service = {
          info: provider.info,
          location: provider.location,
          days: groupOpeningTimes(provider.openingTimes)
        }
        let match = formattedProviders.filter((p) => p.providerId === provider.serviceProviderId)

        if (match.length === 1) {
          match[0].services.push(service)
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
            newProvider.subCategoryList = provider.subCategories
              .map((sc) => sc.name)
              .join(', ')
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

        browser.loaded()
        socialShare.init()
      }
    } else {
      template = 'js-category-no-results-result-tpl'
    }

    analytics.init(theTitle)

    let locationViewModel = locationSelector.getViewModel(currentLocation)
    let viewModel = {
      organisations: formattedProviders,
      subCategories: subCategories,
      categoryName: result.data.category.name,
      categorySynopsis: marked(result.data.category.synopsis),
      locations: locationViewModel
    }
    templating.renderTemplate(template, viewModel, 'js-category-result-output', onRenderCallback)
  })
}
browser.loading()
locationSelector
  .getCurrent()
  .then((result) => {
    currentLocation = result
    findHelp = new FindHelp(result.id)
    let reqSubCat = querystring.parameter('sub-category')
    findHelp.setUrl('category-by-day', 'sub-category', reqSubCat)

    let category = querystring.parameter('category')
    let location = querystring.parameter('location')

    let url = apiRoutes.cities + result.id + '/services/' + findHelp.theCategory
    if (location === 'my-location') {
      url = apiRoutes.servicesByCategory + category + '/' + result.latitude + '/' + result.longitude
    }

    buildList(url)
  }, (_) => {
  })
