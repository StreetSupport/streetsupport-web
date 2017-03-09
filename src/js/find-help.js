/* global history */
var browser = require('./browser')
let supportedCities = require('./location/supportedCities')
let querystring = require('./get-url-parameter')
let getLocation = require('./location/get-location')

import { newElement } from './dom'

var FindHelp = function (location) {
  var self = this
  self.currentLocation = location
  const re = new RegExp(/find-help\/(.*)\//)
  self.theCategory = browser.location().pathname.match(re)[1].split('/')[0]

  if (self.theCategory.startsWith('category')) {
    const redirects = {
      'category': '/',
      'category-by-day': '/timetable/',
      'category-by-location': '/map/'
    }
    const queryStringCategory = querystring.parameter('category')
    browser.redirect(`/find-help/${queryStringCategory}${redirects[self.theCategory]}`)
  }

  self.currentRange = querystring.parameter('range').length === 0
    ? 10000
    : querystring.parameter('range')

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
    options.forEach((c) => {
      const attrs = {
        value: c.id
      }
      if (c.id === location) {
        attrs['selected'] = 'selected'
      }
      dropdown.appendChild(newElement('option', c.name, attrs))
    })

    const range = document.querySelector('.js-find-help-range')
    console.log(range.children)
    Array.prototype.slice.call(range.children).forEach((c) => {
      console.log(c.value, self.currentRange)
      if (parseInt(c.value) === parseInt(self.currentRange)) {
        c.setAttribute('selected', 'selected')
      }
    })
    console.log(range)

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
    console.log(range)

    dropdown.addEventListener('change', updateOnRangeAndLocation)
    console.log(dropdown)
  }

  self.setUrl = function (pageName, subCategoryKey, subCategoryId) {
    let url = '?location=' + self.currentLocation +
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
      var subCategory = querystring.parameter(subCategoryKey)
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
}

module.exports = FindHelp
