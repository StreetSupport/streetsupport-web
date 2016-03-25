var apiRoutes = require('./api')
var categoryEndpoint = require('./category-endpoint')
var urlParameter = require('./get-url-parameter')

var FindHelp = function () {
  var self = this

  self.getLocation = function () {
    var location = urlParameter.parameter('location')
    var savedLocationCookie = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*\=\s*([^;]*).*$)|^.*$/, '$1')
    if (savedLocationCookie.length && location.length === 0) return savedLocationCookie
    if (location === 'my-location') return ''
      return location
  }

  self.buildListener = function (pageName, categoryKey, subCategoryKey) {
    return {
      accordionOpened: function (element, context) {
        var subCategoryId = element.getAttribute('id')
        history.pushState({}, '', pageName + '.html?category=' + self.theCategory +
          '&' + subCategoryKey + '=' + subCategoryId +
          '&location=' + self.getLocation())
      }
    }
  }

  self.handleSubCategoryChange = function (subCategoryKey, accordion) {
    window.onpopstate = function () {
      var subCategory = urlParameter.parameter(subCategoryKey, document.location.search)
      if(subCategory.length) {
        var el = document.getElementById(subCategory)
        var context = document.querySelector('.js-accordion')
        var useAnalytics = true

        accordion.reOpen(el, context, useAnalytics)
      }
    }
  }

  self.theCategory = urlParameter.parameter('category')

  self.buildCategories = function (buildList) {

    var categoryUrl = apiRoutes.categoryServiceProviders += self.theCategory

    categoryEndpoint.getEndpointUrl(categoryUrl, self.getLocation())
      .then(function (success) {
        buildList(success)
      }, function (error) {
      })
  }
  // self.theLocation = self.getLocation()

  // self.categoryUrl = apiRoutes.categoryServiceProviders += self.theCategory

  // self.buildCategories = function (buildList) {
  //   categoryEndpoint
  //     .getEndpointUrl(self.categoryUrl, self.theLocation)
  //     .then(function (success) {
  //       buildList(success)
  //     }, function (error) {
  //     })
  // }
}

module.exports = FindHelp
