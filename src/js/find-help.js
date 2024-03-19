import { PostcodeProximity } from './components/PostcodeProximity'

const browser = require('./browser')
const print = require('./navigation/print')
const querystring = require('./get-url-parameter')

const FindHelp = function (location) {
  const self = this

  self.ui = {
    range: '.js-find-help-range',
    searchBtn: '.js-update-search',
    postcode: '.js-location-search-postcode',
    accordion: '.js-accordion'
  }

  self.currentLocation = location
  const re = new RegExp(/find-help\/(.*)\//)
  self.theCategory = browser.location().pathname.match(re)[1].split('/')[0]

  if (self.theCategory.startsWith('category')) {
    const redirects = {
      category: '/',
      'category-by-day': '/timetable/',
      'category-by-location': '/map/'
    }
    const queryStringCategory = querystring.parameter('category')
    browser.redirect(`/find-help/${queryStringCategory}${redirects[self.theCategory]}`)
  }

  self.currentRange = querystring.parameter('range').length === 0
    ? 10000
    : querystring.parameter('range')

  self.initFindHelpPostcodesLocationSelector = (onChangeCallback) => {
    print.init()

    const decoratedCallback = (locationResult, range) => {
      self.currentRange = range
      const location = browser.location()
      const newUrl = location.href.replace(/(range=)[^&]+/, '$1' + range)
      browser.pushHistory({}, '', newUrl)
      onChangeCallback(locationResult, range)
    }
    const pcpComponent = new PostcodeProximity(self.currentRange, decoratedCallback) // eslint-disable-line
  }

  self.setUrl = function (pageName, subCategoryKey, subCategoryId) {
    let newUrl = '?location=' + self.currentLocation +
              '&range=' + self.currentRange
    if (subCategoryId.length > 0) {
      newUrl += '&' + subCategoryKey + '=' + subCategoryId
    }
    const currUrl = window.location.search
    if (newUrl !== currUrl) browser.pushHistory({}, '', newUrl)
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

        const filterByDayFilter = document.querySelector('.js-filter-by-day')
        if (filterByDayFilter) {
          filterByDayFilter.value = subCategoryId
        }
      }
    }
  }
}

module.exports = FindHelp
