import './common'

let accordion = require('./accordion')
let FindHelp = require('./find-help')
let apiRoutes = require('./api')

let forEach = require('lodash/collection/forEach')

let getApiData = require('./get-api-data')
let templating = require('./template-render')
let analytics = require('./analytics')
let socialShare = require('./social-share')
let browser = require('./browser')
let locationSelector = require('./locationSelector')

let findHelp = new FindHelp()
findHelp.handleSubCategoryChange('sub-category', accordion)
findHelp.buildCategories(apiRoutes.servicesByCategory, buildList)

function buildList (url) {
  browser.loading()

  getApiData.data(url)
  .then(function (result) {
    if (result.status === 'error') {
      window.location.replace('/find-help/')
    }
    let theTitle = result.data.category.name + ' - Street Support'
    document.title = theTitle

    let template = ''
    let callback = function () {
      browser.loaded()
      socialShare.init()
      locationSelector.handler()
    }

    let formattedProviders = []
    let subCategories = []

    if (result.data.providers.length > 0) {
      template = 'js-category-result-tpl'

      forEach(result.data.providers, function (provider) {
        let service = {
          info: provider.info,
          location: provider.location,
          openingTimes: provider.openingTimes
        }
        let match = formattedProviders.filter((p) => p.providerId === provider.providerId)

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
            provider.subCategories
              .forEach((sc) => {
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
      callback = function () {
        accordion.init(true, 0, findHelp.buildListener('category', 'service-provider'), true)

        let providerItems = document.querySelectorAll('.js-item, .js-header')
        let filterItems = document.querySelectorAll('.js-filter-item')

        let filterClickHandler = (e) => {
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
        }

        forEach(filterItems, (item) => {
          item.addEventListener('click', filterClickHandler)
        })
        locationSelector.handler()
        browser.loaded()
        socialShare.init()
      }
    } else {
      template = 'js-category-no-results-result-tpl'
    }

    analytics.init(theTitle)

    var formattedData = {
      category: result.data.category,
      providers: formattedProviders,
      subCategories: subCategories,
      locations: locationSelector.viewModel
    }

    let viewModel = findHelp.buildViewModel('category', formattedData)

    templating.renderTemplate(template, viewModel, 'js-category-result-output', callback)
  })
}
