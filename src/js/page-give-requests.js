// Common modules
import './common'

// Page modules
var awesomplete = require('imports?this=>window!../../node_modules/awesomplete/awesomplete.js') // eslint-disable-line
import List from 'list.js'
// var ListFuzzySearch = require('imports?this=>window!../../node_modules/list.fuzzysearch.js/dist/list.fuzzysearch.js')
import Holder from 'holderjs'
import Bricks from 'bricks.js'

// Page modules
var apiRoutes = require('./api')
var getApiData = require('./get-api-data')
var templating = require('./template-render')
// var Spinner = require('spin.js')

import Find from 'lodash/collection/find'

// Spinner
// var spin = document.getElementById('spin')
// var loading = new Spinner().spin(spin)

// Run Holder
Holder.run({})

// Get API data using promise
getApiData.data(apiRoutes.needs)
  .then(function (result) {
    var needsFromApi = result.data
    // var theData = { 'needs': needsFromApi }

    console.log(needsFromApi)

    // List.js
    var options = {
      valueNames: [ 'id', 'type', 'serviceProviderId', 'description' ],
      item: '<li><a href="#"><span class="id"></span><h3 class="h3 type"></h3><p class="serviceProviderId"></p><p class="description"></p></a></li>',
      plugins: [
        // ListFuzzySearch()
      ]
    }

    const theList = new List('js-card-search', options, needsFromApi)

    // Bricks.js
    const sizes = [
      { columns: 1, gutter: 20 }, // assumed to be mobile, because of the missing mq property
      { mq: '360px', columns: 1, gutter: 20 },
      { mq: '480px', columns: 2, gutter: 20 },
      { mq: '600px', columns: 2, gutter: 20 },
      { mq: '800px', columns: 3, gutter: 20 }
    ]

    const cardLayout = Bricks({
      container: '.list',
      packed: 'data-packed', // if not prefixed with 'data-', it will be added
      sizes: sizes
    })

    cardLayout
      .resize(true) // bind resize handler
      .pack() // pack initial items

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
          activeFilters = []
          resetFiltering()
        } else {
          if (this.classList.contains('is-active')) {
            console.log('already active')
            this.classList.remove('is-active')
            activeFilters.splice(activeFilters.indexOf(getFilter), 1)
            runFiltering()
          } else {
            console.log('not active')

            document.querySelector('.js-filter-item-all').classList.remove('is-active')
            this.classList.add('is-active')
            activeFilters.push(getFilter)
            runFiltering()
          }
        }
      })
    }

    var runFiltering = function () {
      console.log('active filters: ' + activeFilters)

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

      console.log('active filters: ' + activeFilters)

      for (c = 0; c < filters.length; c++) {
        filters[c].classList.remove('is-active')
      }

      document.querySelector('.js-filter-item-all').classList.add('is-active')

      // Reset filter & layout
      theList.filter()
      cardLayout.pack()
    }

    // Full detail view
    var a
    var items = document.querySelectorAll('.list li')

    // Add click listener to each item
    for (a = 0; a < items.length; a++) {
      items[a].addEventListener('click', function (event) {
        event.preventDefault()
        openCard(this)
      })
    }

    var openCard = function (el) {
      var theId = el.getElementsByClassName('id')[0].textContent
      var cardData = Find(needsFromApi, function (o) { return o.id === theId })

      // hide search
      document.querySelector('#js-card-search').classList.remove('is-active')
      document.querySelector('#js-card-search').classList.add('is-hidden')

      // Append object name for Hogan
      var theTemplateData = { card: cardData }

      var callback = function () {
        document.querySelector('.js-card-detail').classList.remove('is-hidden')
        document.querySelector('.js-card-detail').classList.add('is-active')

        window.scrollTo(0, 0)
      }

      templating.renderTemplate('js-card-detail-tpl', theTemplateData, 'js-card-detail-output', callback)
    }
  })

// Example bricks.js api
/*
cardSort
  .on('pack', () => console.log('ALL grid items packed.'))
  .on('update', () => console.log('NEW grid items packed.'))
  .on('resize', size => console.log('The grid has be re-packed to accommodate a new BREAKPOINT.'))
*/
