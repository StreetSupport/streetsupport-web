/* global history */
var urlParameter = require('./get-url-parameter')
var browser = require('./browser')
var forEach = require('lodash/collection/forEach')
let supportedCities = require('./location/supportedCities')
let querystring = require('./get-url-parameter')
let getLocation = require('./location/get-location')

var FindHelp = function (location) {
  var self = this

  self.currentLocation = location
  self.theCategory = urlParameter.parameter('category')
  self.currentRange = urlParameter.parameter('range').length === 0
    ? 10000
    : urlParameter.parameter('range')

  self.initFindHelpLocationSelector = () => {
    const dropdown = document.querySelector('.js-find-help-dropdown')
    let options = supportedCities.locations
      .filter((c) => c.isSelectableInBody)
      .map((c) => {
        return {
          id: c.id,
          name: c.name
        }
      })
    if (getLocation.isAvailable()) {
      options.unshift({
        id: 'my-location',
        name: 'my location'
      })
    }
    forEach(options, (c) => {
      const option = document.createElement('option')
      option.setAttribute('value', c.id)
      option.innerHTML = c.name
      const currLocation = querystring.parameter('location')
      if (c.id === currLocation) {
        option.setAttribute('selected', 'selected')
      }
      dropdown.appendChild(option)
    })

    const range = document.querySelector('.js-find-help-range')
    forEach(range.children, (c) => {
      if (parseInt(c.value) === parseInt(self.currentRange)) {
        c.setAttribute('selected', 'selected')
      }
    })

    const updateOnRangeAndLocation = (event) => {
      event.preventDefault()
      const location = document.querySelector('.js-find-help-dropdown').value
      const range = document.querySelector('.js-find-help-range').value
      let newQueryString = window.location.search
        .replace(querystring.parameter('location'), location)

      if (newQueryString.indexOf('range') >= 0) {
        newQueryString = newQueryString.replace(querystring.parameter('range'), range)
      } else {
        newQueryString += '&range=' + range
      }

      window.location.href = window.location.pathname + newQueryString
    }

    range.addEventListener('change', updateOnRangeAndLocation)
    dropdown.addEventListener('change', updateOnRangeAndLocation)
  }

  self.setUrl = function (pageName, subCategoryKey, subCategoryId) {
    let url = '?category=' + self.theCategory +
              '&location=' + self.currentLocation +
              '&range=' + self.currentRange
    if (subCategoryId.length > 0) {
      url += '&' + subCategoryKey + '=' + subCategoryId
    }
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
