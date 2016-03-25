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

  self.buildListener = function (categoryKey, subCategoryKey) {
    return {
      accordionOpened: function (element, context) {
        var subCategoryId = element.getAttribute('id')
        history.pushState({}, '', 'category-by-day.html?category=' + categoryKey + '&' + subCategoryKey + '=' + subCategoryId)
      }
    }
  }

  self.setTitle = function (categoryName) {
    document.title = categoryName + ' - Street Support'
  }

  self.handleSubCategoryChange = function (subCategoryKey, accordion) {
    window.onpopstate = function () {
      var subCategory = urlParameter.parameterFromString(document.location.search, subCategoryKey)
      var el = document.getElementById(subCategory)
      var context = document.querySelector('.js-accordion')
      var useAnalytics = true

      accordion.reOpen(el, context, useAnalytics)
    }
  }
}

module.exports = FindHelp
