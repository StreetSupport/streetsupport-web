// Common modules
import './common'

// Page modules
let accordion = require('./accordion')
let FindHelp = require('./find-help')
let apiRoutes = require('./api')

// Lodash
let forEach = require('lodash/collection/forEach')

let getApiData = require('./get-api-data')
let templating = require('./template-render')
let analytics = require('./analytics')
let socialShare = require('./social-share')
let browser = require('./browser')

let findHelp = new FindHelp()
findHelp.handleSubCategoryChange('sub-category', accordion)
findHelp.buildCategories(apiRoutes.servicesByCategory, buildList)

function buildList (url) {
  browser.loading()

  // Get API data using promise
  getApiData.data(url)
  .then(function (result) {
    if (result.status === 'error' || result.data.length === 0) {
      window.location.replace('/find-help/')
    }
    let theTitle = result.data[0].categoryName + ' - Street Support'
    document.title = theTitle

    let template = ''
    let callback = function () {}

    let formattedData = []

    if (result.data.length > 0) {
      template = 'js-category-result-tpl'

      forEach(result.data, function (provider) {
        let service = {
          info: provider.info,
          location: provider.location,
          openingTimes: provider.openingTimes
        }
        let match = formattedData.filter((p) => p.providerId === provider.providerId)

        if (match.length === 1) {
          match[0].services.push(service)
        } else {
          let newProvider = {
            categoryId: provider.categoryId,
            categoryName: provider.categoryName,
            categorySynopsis: provider.categorySynopsis,
            providerId: provider.providerId,
            providerName: provider.providerName,
            services: [service]
          }
          if (provider.tags !== null) {
            newProvider.tags = provider.tags.join(', ')
          }
          if (provider.subCategories !== null) {
            newProvider.subCategories = provider.subCategories
              .map((sc) => sc.name)
              .join(', ')
          }
          formattedData.push(newProvider)
        }
      })
    } else {
      template = 'js-category-no-results-result-tpl'
    }

    callback = function () {
      accordion.init(true, 0, findHelp.buildListener('category', 'sub-category'))
      browser.loaded()
      socialShare.init()
    }

    console.log(formattedData)

    analytics.init(theTitle)

    let viewModel = findHelp.buildViewModel('category', formattedData)
    templating.renderTemplate(template, viewModel, 'js-category-result-output', callback)
  })
}
