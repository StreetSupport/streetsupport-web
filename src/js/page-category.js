// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var urlParameter = require('./get-url-parameter')
var accordion = require('./accordion')
var socialShare = require('./social-share')
var sortBy = require('lodash/collection/sortBy')
var forEach = require('lodash/collection/forEach')
var findIndex = require('lodash/array/findIndex')

nav.init()
FastClick.attach(document.body)

// Load and process data
require.ensure(['./api', './get-api-data', './category-endpoint', './template-render', 'spin.js', './analytics'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var categoryEndpoint = require('./category-endpoint')
  var templating = require('./template-render')
  var Spinner = require('spin.js')
  var analytics = require('./analytics')

  // Spinner
  var spin = document.getElementById('spin')
  var loading = new Spinner().spin(spin)

  // Get category and create URL
  var theCategory = urlParameter.parameter('category')
  var theLocation = urlParameter.parameter('location')
  var subCategoryToOpen = urlParameter.parameter('sub-category')

  var savedLocationCookie = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*\=\s*([^;]*).*$)|^.*$/, "$1");

  var getKeyValuePairs = function (param) {
    return param.split('=')
  }

  var getUrlParameter = function (url, reqKey) {
    var queryString = url.split('?')[1]
    var params = queryString.split('&')
    return params
      .map(param => getKeyValuePairs(param))
      .find(kv => kv[0] === reqKey)[1]
  }

  var listener = {
    accordionOpened: function (element, context) {
      console.log(element, context)
      var subCategoryId = element.getAttribute('id')
      history.pushState({}, '', 'category.html?category=' + theCategory + '&sub-category=' + subCategoryId)
    }
  }

  if(savedLocationCookie.length && theLocation.length === 0) {
    theLocation = savedLocationCookie
  }

  if(theLocation === 'my-location') {
    theLocation = '' // clear it so category-endpoint uses geolocation...
  }

  var categoryUrl = apiRoutes.categoryServiceProviders += theCategory

  categoryEndpoint.getEndpointUrl(categoryUrl, theLocation).then(function (success) {
    buildList(success)
  }, function (error) { })

  function buildList (url) {
    // Get API data using promise
    getApiData.data(url).then(function (result) {
      if (result.status === 'error') {
        window.location.replace('/find-help.html')
      }
      var data = result.data

      // Get category name and edit page title
      var theTitle = data.name + ' - Street Support'
      document.title = theTitle

      data.subCategories = sortBy(data.subCategories, function (item) {
        return item.name
      })

      forEach(data.subCategories, function (subCat) {
        forEach(subCat.serviceProviders, function (provider) {
          if (provider.tags !== null) {
            provider.tags = provider.tags.join(', ')
          }
        })
      })

      var hasSetManchesterAsLocation = theLocation === 'manchester'

      var subCategoryIndexToOpen = findIndex(data.subCategories, function(subCat) {
        return subCat.key === subCategoryToOpen
      })

      window.onpopstate = function(event) {
        var subCategory = getUrlParameter(document.location.search, 'sub-category')

        var el = document.getElementById(subCategory)
        var context = document.querySelector('.js-accordion')
        var useAnalytics = true

        accordion.reOpen(el, context, useAnalytics)
      }

      var theData = {
        organisations: data,
        pageAsFromManchester: 'category.html?category=' + theCategory + '&location=manchester',
        pageFromCurrentLocation: 'category.html?category=' + theCategory + '&location=my-location',
        useManchesterAsLocation: hasSetManchesterAsLocation,
        useGeoLocation: !hasSetManchesterAsLocation
      }
      var template = ''
      var callback = function () {}

      if (data.subCategories.length) {
        template = 'js-category-result-tpl'
        callback = function () {
          accordion.init(false, subCategoryIndexToOpen, listener)
        }
      } else {
        template = 'js-category-no-results-result-tpl'
      }

      templating.renderTemplate(template, theData, 'js-category-result-output', callback)

      loading.stop()
      analytics.init(theTitle)
      socialShare.init()
    })
  }
})
