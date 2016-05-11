/* global history */

import './common'

let Awesomplete = require('awesomplete') // eslint-disable-line
let geolib = require('geolib')
import List from 'list.js'
import Holder from 'holderjs'
import Bricks from 'bricks.js'
import Find from 'lodash/collection/find'
import ForEach from 'lodash/collection/forEach'
import moment from 'moment'

let apiRoutes = require('./api')
let browser = require('./browser')
let getApiData = require('./get-api-data')
let getLocation = require('./get-location')
let templating = require('./template-render')
let getUrlParams = require('./get-url-parameter')
let accordion = require('./accordion')
let socialShare = require('./social-share')
import listToSelect from './list-to-dropdown'

let formatDate = (needs) => {
  // Change to relative date
  ForEach(needs, function (need) {
    need.formattedCreationDate = moment(need.creationDate).fromNow()
  })

  return needs
}

let renderNeeds = (needs) => {
  let theData = { card: needs }

  let listCallback = () => {
    buildList()
    buildCard(needs)
    browser.loaded()
  }

  templating.renderTemplate('js-card-list-tpl', theData, 'js-card-list-output', listCallback)
}

let initAutoComplete = (needs) => {
  let keywords = needs
    .map((n) => n.keywords)
    .filter((k) => k.length > 0)
    .join(',')

  let input = document.querySelector('.search')
  let awesomplete = new Awesomplete(input, {list: keywords}) // eslint-disable-line
}

let useDistanceForLocation = (position, needs) => {
  let latitude = position.coords.latitude
  let longitude = position.coords.longitude
  needs.forEach((n) => {
    let distanceInMetres = geolib.getDistance(
      { latitude: latitude, longitude: longitude },
      { latitude: n.latitude, longitude: n.longitude }
    )
    n.distanceAwayInMetres = distanceInMetres
    n.locationDescription = (distanceInMetres * 0.00062137).toFixed(2) + ' miles away'
  })

  return needs
}

let usePostcodeForLocation = (needs) => {
  needs.forEach((n) => {
    n.locationDescription = n.postcode
  })
  return needs
}

let init = () => {
  browser.loading()
  listToSelect.init()
  getApiData.data(apiRoutes.needs)
    .then(function (result) {
      let needsFromApi = formatDate(result.data)

      initAutoComplete(needsFromApi)

      if (navigator.geolocation) {
        getLocation.location().then(function (position) {
          renderNeeds(useDistanceForLocation(position, needsFromApi))
        }, () => {
          renderNeeds(usePostcodeForLocation(needsFromApi))
        })
      } else {
        renderNeeds(usePostcodeForLocation(needsFromApi))
      }
    })
}

let initBricks = () => {
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

  return cardLayout
}

let initList = (cardLayout) => {
   // List.js
  let options = {
    valueNames: [ 'type', 'serviceProviderName', 'creationDate', 'description', 'keywords', 'distanceAwayInMetres' ],
    plugins: []
  }

  let theList = new List('js-card-search', options)
  theList.sort('creationDate', { order: 'desc' })
  cardLayout.resize(true).pack()

  // List.js Triggers
  theList.on('sortStart', () =>
   cardLayout.pack()
  )

  theList.on('searchComplete', () =>
   cardLayout.pack()
  )

  return theList
}

let initFiltering = (theList, cardLayout) => {
  let runFiltering = () => {
    if (activeFilters.length === 0) {
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

  let resetFiltering = () => {
    // Reset active states
    let c
    let filters = document.querySelectorAll('.js-filter-item')

    activeFilters = []

    for (c = 0; c < filters.length; c++) {
      filters[c].classList.remove('is-active')
    }

    document.querySelector('.js-filter-item-all').classList.add('is-active')

    // Reset filter & layout
    theList.filter()
    cardLayout.pack()
  }

  let filters = document.querySelectorAll('.js-filter-item')
  let activeFilters = []

  // Add click listener to each item
  for (let b = 0; b < filters.length; b++) {
    filters[b].addEventListener('click', function (event) {
      let getFilter = this.getAttribute('data-filter')
      event.preventDefault()

      if (getFilter === 'all') {
        resetFiltering()
      } else {
        if (this.classList.contains('is-active')) {
          this.classList.remove('is-active')
          activeFilters.splice(activeFilters.indexOf(getFilter), 1)
          runFiltering()
        } else {
          document.querySelector('.js-filter-item-all').classList.remove('is-active')
          this.classList.add('is-active')
          activeFilters.push(getFilter)
          runFiltering()
        }
      }
    })
  }

  // Add change listener to `<select>` for small screens
  let filterList = document.querySelectorAll('.js-filter-list.list-to-dropdown__select')
  for (let c = 0; c < filterList.length; c++) {
    filterList[c].addEventListener('change', () => {
    })
  }
}

let initSorting = (theList, cardLayout) => {
  document.querySelector('.js-sort-dropdown')
    .addEventListener('change', function (event) {
      let sortFields = []
      sortFields['organisation'] = 'serviceProviderName'
      sortFields['date'] = 'creationDate'
      sortFields['distance'] = 'distanceAwayInMetres'

      let selectedSort = this.options[this.selectedIndex].value
      let [field, direction] = selectedSort.split('-')
      theList.sort(sortFields[field], { order: direction })
      cardLayout.pack()
    })
}

let buildList = () => {
  let cardLayout = initBricks()
  let theList = initList(cardLayout)

  initFiltering(theList, cardLayout)
  initSorting(theList, cardLayout)
}

// Full detail view
let buildCard = function (data) {
  let openCard = function (el, cardBackOnClick) {
    let cardCallback = () => {
      document.querySelector('.js-card-detail').classList.remove('is-hidden')
      document.querySelector('.js-card-detail').classList.add('is-active')

      window.scrollTo(0, 0)

      Holder.run({})

      // TODO: Proper URL support
      let state = { test: 'TBA' }
      let theId = el.getAttribute('data-id')
      history.pushState(state, 'TEST', '?id=' + theId)

      let d
      let cardBack = document.querySelectorAll('.js-card-back')

      // Add click listener to each item
      for (d = 0; d < cardBack.length; d++) {
        cardBack[d].addEventListener('click', function (event) {
          event.preventDefault()
          cardBackOnClick()
        })
      }

      accordion.init(false)
      socialShare.updateSharePageHrefs()
    }

    let init = () => {
      let theId = el.getAttribute('data-id')
      let cardData = Find(data, function (o) { return o.id === theId })

      // hide search
      document.querySelector('#js-card-search').classList.remove('is-active')
      document.querySelector('#js-card-search').classList.add('is-hidden')

      // Append object name for Hogan
      let theCardTemplateData = { card: cardData }

      templating.renderTemplate('js-card-detail-tpl', theCardTemplateData, 'js-card-detail-output', cardCallback)
    }

    init()
  }

  let openIfCardRequested = () => {
    let cardId = getUrlParams.parameter('id')
    if (cardId) {
      let card = Find(document.querySelectorAll('.requests-listing__item'), (c) => {
        return c.getAttribute('data-id') === cardId
      })
      openCard(card, () => {
        history.pushState({}, 'from openIfCardRequested', '?')
        closeCard()
      })
    }
  }

  let rewindHistory = () => {
    window.history.back()
  }

  let closeCard = () => {
    document.querySelector('#js-card-search').classList.remove('is-hidden')
    document.querySelector('#js-card-search').classList.add('is-active')

    document.querySelector('.js-card-detail').classList.remove('is-active')
    document.querySelector('.js-card-detail').classList.add('is-hidden')
  }

  let items = document.querySelectorAll('.requests-listing__item')

  // Add click listener to each item
  for (var a = 0; a < items.length; a++) {
    items[a].addEventListener('click', function (event) {
      event.preventDefault()
      openCard(this, rewindHistory)
    })
  }

  window.onpopstate = () => {
    closeCard()
    openIfCardRequested()
  }

  openIfCardRequested()
}

init()
