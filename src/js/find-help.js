/* global history */
var urlParameter = require('./get-url-parameter')
var browser = require('./browser')
var forEach = require('lodash/collection/forEach')

var FindHelp = function (location) {
  var self = this

  self.currentLocation = location
  self.theCategory = urlParameter.parameter('category')

  self.setUrl = function (pageName, subCategoryKey, subCategoryId) {
    let url = '?category=' + self.theCategory +
              '&location=' + self.currentLocation
    if (subCategoryId.length > 0) {
      url += '&' + subCategoryKey + '=' + subCategoryId
    }
    console.log(window.location.search)
    console.log(url)
    if (url !== window.location.search) history.pushState({}, '', url)
  }

  self.scrollTo = (subCategoryId) => {
    window.setTimeout(() => {
      browser.scrollTo('#' + subCategoryId)
    }, 300)
  }

  self.buildListener = function (pageName, subCategoryKey) {
    return {
      accordionOpened: function (element, context) {
        const subCategoryId = element.getAttribute('id')
        self.setUrl(pageName, subCategoryKey, subCategoryId)
        self.scrollTo(subCategoryId)
      }
    }
  }

  self.handleSubCategoryChange = function (subCategoryKey, accordion) {
    window.onpopstate = function () {
      var subCategory = urlParameter.parameter(subCategoryKey)
      if (subCategory.length) {
        var el = document.getElementById(subCategory)
        var context = document.querySelector('.js-accordion')
        var useAnalytics = true

        accordion.reOpen(el, context, useAnalytics)
      }
    }
  }

  self.formatTags = function (subCategories) {
    forEach(subCategories, (subCat) => {
      forEach(subCat.serviceProviders, (provider) => {
        if (provider.tags !== null) {
          provider.tags = provider.tags.join(', ')
        }
      })
    })
  }
}

module.exports = FindHelp
