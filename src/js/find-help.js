/* global history */
var categoryEndpoint = require('./category-endpoint')
var urlParameter = require('./get-url-parameter')
var browser = require('./browser')

var FindHelp = function () {
  var self = this

  self.getLocation = function () {
    var location = urlParameter.parameter('location')
    var savedLocationCookie = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*\=\s*([^;]*).*$)|^.*$/, '$1')
    if (savedLocationCookie.length && location.length === 0) return savedLocationCookie
    if (location === 'my-location') return ''
    return location
  }

  self.setUrl = function (pageName, subCategoryKey, subCategoryId) {
    history.pushState({}, '', '?category=' + self.theCategory +
      '&' + subCategoryKey + '=' + subCategoryId +
      '&location=' + self.getLocation())
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

    categoryEndpoint.getEndpointUrl(categoryUrl, self.getLocation())
      .then(function (success) {
        buildList(success)
      }, function () {
      })
  }

  self.buildViewModel = function (pagename, data) {
    var hasSetManchesterAsLocation = self.getLocation() === 'manchester'

    return {
      organisations: data,
      pageAsFromManchester: '?category=' + self.theCategory + '&location=manchester',
      pageFromCurrentLocation: '?category=' + self.theCategory + '&location=my-location',
      useManchesterAsLocation: hasSetManchesterAsLocation,
      useGeoLocation: !hasSetManchesterAsLocation
    }
  }
}

module.exports = FindHelp
