/* global history */

// Common modules
import './common'

// Page modules
var Awesomplete = require('awesomplete') // eslint-disable-line
var geolib = require('geolib')
import List from 'list.js'
// var ListFuzzySearch = require('imports?this=>window!../../node_modules/list.fuzzysearch.js/dist/list.fuzzysearch.js')
import Holder from 'holderjs'
import Bricks from 'bricks.js'

// Page modules
var apiRoutes = require('./api')
var browser = require('./browser')
var getApiData = require('./get-api-data')
var getLocation = require('./get-location')
var templating = require('./template-render')
var getUrlParams = require('./get-url-parameter')
// var Spinner = require('spin.js')

import Find from 'lodash/collection/find'
import ForEach from 'lodash/collection/forEach'

import moment from 'moment'

import listToSelect from './list-to-dropdown'

listToSelect.init()

browser.loading()

// Get API data using promise
getApiData.data(apiRoutes.needs)
  .then(function (result) {
    var needsFromApi = result.data

    var renderNeeds = function () {
      console.log('rendering needs')
      // Change to relative date
      ForEach(needsFromApi, function (data) {
        data.formattedCreationDate = moment(data.creationDate).fromNow()
      })

      // Append object name for Hogan
      var theData = { card: needsFromApi }

      var keywords = needsFromApi
        .map((n) => n.keywords)
        .filter((k) => k.length > 0)
        .join(',')

      var input = document.querySelector('.search')
      var awesomplete = new Awesomplete(input, {list: keywords}) // eslint-disable-line

      // Template callback
      var listCallback = function () {
        buildList()
        buildCard(needsFromApi)
        browser.loaded()
      }

      templating.renderTemplate('js-card-list-tpl', theData, 'js-card-list-output', listCallback)
    }

    if (navigator.geolocation) {
      getLocation.location().then(function (position) {
        var latitude = position.coords.latitude
        var longitude = position.coords.longitude
        needsFromApi.forEach((n) => {
          var distanceInMetres = geolib.getDistance(
            { latitude: latitude, longitude: longitude },
            { latitude: n.latitude, longitude: n.longitude }
          )
          n.distanceAwayInMetres = distanceInMetres
          n.locationDescription = (distanceInMetres * 0.00062137).toFixed(2) + ' miles away'
        })
        renderNeeds()
      }, function (error) {
        if (error !== null) {
          console.log(error)
        }
      })
    } else {
      needsFromApi.forEach((n) => {
        n.locationDescription = n.postcode
      })
      renderNeeds()
    }
  })

var buildList = function () {
  // Bricks.js
  const sizes = [
   { columns: 1, gutter: 20 }, // assumed to be mobile, because of the missing mq property
   { mq: '360px', columns: 1, gutter: 20 },
   { mq: '480px', columns: 2, gutter: 20 },
   { mq: '600px', columns: 2, gutter: 20 },
   { mq: '800px', columns: 3, gutter: 20 }
  ]

  const cardLayout = Bricks({
    container: '#js-card-list',
    packed: 'data-packed', // if not prefixed with 'data-', it will be added
    sizes: sizes
  })

  cardLayout
   .resize(true) // bind resize handler
   .pack() // pack initial items

   // List.js
  var options = {
    valueNames: [ 'type', 'serviceProviderName', 'creationDate', 'description', 'keywords', 'distanceAwayInMetres' ],
    plugins: [
      // ListFuzzySearch()
    ]
  }

  const theList = new List('js-card-search', options)

  // List.js Triggers
  theList.on('sortStart', () =>
   cardLayout.pack()
  )

  theList.on('searchComplete', () =>
   cardLayout.pack()
  )

  // Filtering
  var b
  var filters = document.querySelectorAll('.js-filter-item')
  var activeFilters = []

  // Add click listener to each item
  for (b = 0; b < filters.length; b++) {
    filters[b].addEventListener('click', function (event) {
      var getFilter = this.getAttribute('data-filter')
      event.preventDefault()

      console.log('filter clicked: ' + getFilter)

      if (getFilter === 'all') {
        resetFiltering()
      } else {
        if (this.classList.contains('is-active')) {
          console.log('this filter is already active')
          this.classList.remove('is-active')
          activeFilters.splice(activeFilters.indexOf(getFilter), 1)
          runFiltering()
        } else {
          console.log('this filter is not already active')

          document.querySelector('.js-filter-item-all').classList.remove('is-active')
          this.classList.add('is-active')
          activeFilters.push(getFilter)
          runFiltering()
        }
      }
    })
  }

  // Add change listener to `<select>` for small screens
  var c
  var filterList = document.querySelectorAll('.js-filter-list.list-to-dropdown__select')
  for (c = 0; c < filterList.length; c++) {
    filterList[c].addEventListener('change', function () {
      console.log('filtering')
    })
  }

  var runFiltering = function () {
    console.log('active filters: ' + activeFilters)

    if (activeFilters.length === 0) {
      console.log('no active filters, abort and reset')
      resetFiltering()
      return
    }

    theList.filter(function (item) {
      if (activeFilters.length > 0) {
        return (activeFilters.indexOf(item.values().type)) > -1
      }
      return true
    })

    cardLayout.pack()
  }

  var resetFiltering = function () {
    // Reset active states
    var c
    var filters = document.querySelectorAll('.js-filter-item')

    activeFilters = []

    console.log('reset filter function')
    console.log('active filters (there should be none): ' + activeFilters)

    for (c = 0; c < filters.length; c++) {
      filters[c].classList.remove('is-active')
    }

    document.querySelector('.js-filter-item-all').classList.add('is-active')

    // Reset filter & layout
    theList.filter()
    cardLayout.pack()
  }

  // Sorting
  document.querySelector('.js-sort-dropdown')
    .addEventListener('change', function (event) {
      let sortFields = []
      sortFields['organisation'] = 'serviceProviderName'
      sortFields['date'] = 'creationDate'
      sortFields['distance'] = 'distanceAwayInMetres'

      let selectedSort = this.options[this.selectedIndex].value
      let [field, direction] = selectedSort.split('-')
      console.log(sortFields[field])
      theList.sort(sortFields[field], { order: direction });
      cardLayout.pack()
    })
}

// Full detail view
var buildCard = function (data) {
  var openCard = function (el, cardBackOnClick) {
    var theId = el.getAttribute('data-id')
    var cardData = Find(theApiData, function (o) { return o.id === theId })

    console.log(cardData)

    // hide search
    document.querySelector('#js-card-search').classList.remove('is-active')
    document.querySelector('#js-card-search').classList.add('is-hidden')

    // Append object name for Hogan
    var theCardTemplateData = { card: cardData }

    var cardCallback = function () {
      document.querySelector('.js-card-detail').classList.remove('is-hidden')
      document.querySelector('.js-card-detail').classList.add('is-active')

      window.scrollTo(0, 0)

      Holder.run({})

      // TODO: Proper URL support
      var state = { test: 'TBA' }
      history.pushState(state, 'TEST', '?id=' + theId)

      var d
      var cardBack = document.querySelectorAll('.js-card-back')

      // Add click listener to each item
      for (d = 0; d < cardBack.length; d++) {
        cardBack[d].addEventListener('click', function (event) {
          event.preventDefault()
          cardBackOnClick()
        })
      }
    }

    templating.renderTemplate('js-card-detail-tpl', theCardTemplateData, 'js-card-detail-output', cardCallback)
  }
  var openIfCardRequested = function () {
    var cardId = getUrlParams.parameter('id')
    if (cardId) {
      var card = Array.from(document.querySelectorAll('.requests-listing__item'))
        .filter((c) => c.getAttribute('data-id') === cardId)[0]
      openCard(card, function () {
        history.pushState({}, 'from openIfCardRequested', '?')
        closeCard()
      })
    }
  }

  var a
  var items = document.querySelectorAll('.requests-listing__item')
  var theApiData = data

  // Add click listener to each item
  for (a = 0; a < items.length; a++) {
    items[a].addEventListener('click', function (event) {
      event.preventDefault()
      openCard(this, rewindHistory)
    })
  }

  openIfCardRequested()

  var rewindHistory = function () {
    window.history.back()
  }

  window.onpopstate = function () {
    closeCard()
    openIfCardRequested()
  }

  var closeCard = function () {
    document.querySelector('#js-card-search').classList.remove('is-hidden')
    document.querySelector('#js-card-search').classList.add('is-active')

    document.querySelector('.js-card-detail').classList.remove('is-active')
    document.querySelector('.js-card-detail').classList.add('is-hidden')
  }
}

// Example bricks.js api
/*
cardSort
  .on('pack', () => console.log('ALL grid items packed.'))
  .on('update', () => console.log('NEW grid items packed.'))
  .on('resize', size => console.log('The grid has be re-packed to accommodate a new BREAKPOINT.'))
*/
