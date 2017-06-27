const browser = require('./browser')
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

  self.initFindHelpPostcodesLocationSelector = (onChangeCallback) => {
    const range = document.querySelector(self.ui.range)
    // set range dropdown to selected
    Array.from(range.children)
      .forEach((c) => {
        if (parseInt(c.value) === parseInt(self.currentRange)) {
          c.setAttribute('selected', 'selected')
        }
      })

    const updateSearchButton = document.querySelector(self.ui.searchBtn)
    if (updateSearchButton) {
      updateSearchButton.addEventListener('click', (e) => {
        e.preventDefault()
        const locationSearchPostcode = document.querySelector(self.ui.postcode)
        const rangeVal = range.value
        const postcodeValue = locationSearchPostcode.value

        self.currentRange = rangeVal

        onChangeCallback(rangeVal, postcodeValue)
      }, () => {
        console.log('error')
      })
    }
  }

  self.setUrl = function (pageName, subCategoryKey, subCategoryId) {
    let url = '?location=' + self.currentLocation +
              '&range=' + self.currentRange
    if (subCategoryId.length > 0) {
      url += '&' + subCategoryKey + '=' + subCategoryId
    }
    if (url !== window.location.search) browser.pushHistory({}, '', url)
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
}

module.exports = FindHelp
