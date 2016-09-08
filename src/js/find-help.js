/* global history */
var categoryEndpoint = require('./category-endpoint')
var urlParameter = require('./get-url-parameter')
var browser = require('./browser')

var FindHelp = function (location) {
  var self = this

  self.currentLocation = location

  self.setUrl = function (pageName, subCategoryKey, subCategoryId) {
    history.pushState({}, '', '?category=' + self.theCategory +
      '&' + subCategoryKey + '=' + subCategoryId +
      '&location=' + self.currentLocation)
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
    subCategories.forEach((subCat) => {
      subCat.serviceProviders.forEach((provider) => {
        if (provider.tags !== null) {
          provider.tags = provider.tags.join(', ')
        }
      })
    })
  }

  self.theCategory = urlParameter.parameter('category')

  self.buildCategories = function (endpoint, buildList) {
    var categoryUrl = endpoint += self.theCategory

    categoryEndpoint.getEndpointUrl(categoryUrl, self.currentLocation)
      .then(function (success) {
        buildList(success)
      }, function () {
      })
  }
}

module.exports = FindHelp
