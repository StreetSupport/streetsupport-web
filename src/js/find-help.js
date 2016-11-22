/* global history */
var urlParameter = require('./get-url-parameter')
var browser = require('./browser')
var forEach = require('lodash/collection/forEach')
let supportedCities = require('./location/supportedCities')
let querystring = require('./get-url-parameter')

var FindHelp = function (location) {
  var self = this

  self.currentLocation = location
  self.theCategory = urlParameter.parameter('category')

  self.initFindHelpLocationSelector = () => {
    let dropdown = document.querySelector('.js-find-help-location-selector')
    let options = supportedCities.locations
      .map((c) => {
        return {
          id: c.id,
          name: c.name
        }
      })
    options.unshift({
      id: 'my-location',
      name: 'my location'
    })
    forEach(options, (c) => {
      let option = document.createElement('option')
      option.setAttribute('value', c.id)
      option.innerHTML = c.name
      let currLocation = querystring.parameter('location')
      if (c.id === currLocation) {
        option.setAttribute('selected', 'selected')
      }
      dropdown.appendChild(option)
    })

    dropdown.addEventListener('change', (event) => {
      console.log(window.location)
      let newLocation = event.target.value
      let newQueryString = window.location.search.replace(querystring.parameter('location'), newLocation)
      window.location.href = window.location.pathname + newQueryString
    })
  }


  self.setUrl = function (pageName, subCategoryKey, subCategoryId) {
    let url = '?category=' + self.theCategory +
              '&location=' + self.currentLocation
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
