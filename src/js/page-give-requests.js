/* global history */

import './common'

const Awesomplete = require('awesomplete')
const geolib = require('geolib')
import List from 'list.js'
import Holder from 'holderjs'
import Find from 'lodash/collection/find'
import ForEach from 'lodash/collection/forEach'
import moment from 'moment'
import htmlEncode from 'htmlencode'
const ko = require('knockout')

const apiRoutes = require('./api')
const browser = require('./browser')
const ContactFormModel = require('./models/GiveItemModel')
const getApiData = require('./get-api-data')
const getLocation = require('./location/get-location')
const getUrlParams = require('./get-url-parameter')
import listToSelect from './list-to-dropdown'
const locationSelector = require('./location/locationSelector')
const socialShare = require('./social-share')
const templating = require('./template-render')

const activeClass = 'is-active'

const formatDate = (needs) => {
  ForEach(needs, function (need) {
    need.formattedCreationDate = moment(need.creationDate).fromNow()
  })

  return needs
}

const onChangeLocation = function () {
  browser.redirect('/give-help/help/?my-location')
}

const renderNeeds = (needs, userLocation) => {
  const theData = {
    card: needs,
    location: userLocation.name,
    geoLocationUnavailable: userLocation.geoLocationUnavailable
  }

  if (needs.length === 0) {
    templating.renderTemplate('js-no-data-tpl', theData, 'js-card-list-output', () => {
      locationSelector.handler(onChangeLocation)
      browser.loaded()
    })
  } else {
    templating.renderTemplate('js-card-list-tpl', theData, 'js-card-list-output', () => {
      buildList()
      buildCard(needs)
      listToSelect.init()
      locationSelector.handler(onChangeLocation)
      initAutoComplete(needs)
      browser.loaded()
    })
  }
}

let initAutoComplete = (needs) => {
  let keywords = needs
    .map((n) => n.keywords)
    .filter((k) => k.length > 0)
    .join(',')

  let input = document.querySelector('.search')
  new Awesomplete(input, {list: keywords}) // eslint-disable-line
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

let init = function (userLocation) {
  let url = `${apiRoutes.needsHAL}?longitude=${userLocation.longitude}&latitude=${userLocation.latitude}&limit=100`
  getApiData.data(url)
    .then(function (result) {
      let needsFromApi = formatDate(result.data.items)

      if (!userLocation.geoLocationUnavailable) {
        getLocation.location()
          .then(function (position) {
            renderNeeds(useDistanceForLocation(position, needsFromApi), userLocation)
          }, () => {
            renderNeeds(usePostcodeForLocation(needsFromApi), userLocation)
          })
      } else {
        renderNeeds(usePostcodeForLocation(needsFromApi), userLocation)
      }
    })
}

let initList = () => {
   // List.js
  let options = {
    valueNames: [ 'type', 'serviceProviderName', 'creationDate', 'description', 'keywords', 'distanceAwayInMetres' ],
    plugins: []
  }

  let theList = new List('js-card-search', options)
  theList.sort('creationDate', { order: 'desc' })

  return theList
}

let initFiltering = (theList) => {
  let runFiltering = () => {
    if (activeFilters.length === 0) {
      resetFiltering()
      return
    }

    theList.filter((item) => {
      if (activeFilters.length > 0) {
        return (activeFilters.indexOf(item.values().type)) > -1
      }
      return true
    })
  }

  let resetFiltering = () => {
    // Reset active states
    let c
    let filters = document.querySelectorAll('.js-filter-item')

    activeFilters = []

    for (c = 0; c < filters.length; c++) {
      filters[c].classList.remove(activeClass)
    }

    document.querySelector('.js-filter-item-all').classList.add(activeClass)

    // Reset filter & layout
    theList.filter()
  }

  let filters = document.querySelectorAll('.js-filter-item')
  let activeFilters = []

  // Add click listener to each item
  for (let b = 0; b < filters.length; b++) {
    filters[b].addEventListener('click', (event) => {
      let self = event.target
      let getFilter = self.getAttribute('data-filter')
      event.preventDefault()

      if (getFilter === 'all') {
        resetFiltering()
      } else {
        document.querySelector('.js-filter-item-all').classList.remove(activeClass)
        ForEach(filters, (f) => f.classList.remove(activeClass))
        self.classList.add(activeClass)
        activeFilters = [getFilter]
        runFiltering()
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

let initSorting = (theList) => {
  const sortCriteriaButtons = document.querySelectorAll('.js-sort-criteria')
  ForEach(sortCriteriaButtons, (b) => {
    b.addEventListener('click', (event) => {
      let sortFields = []
      sortFields['organisation'] = 'serviceProviderName'
      sortFields['date'] = 'creationDate'
      sortFields['distance'] = 'distanceAwayInMetres'

      let selectedSort = event.target.getAttribute('data-sort')
      let [field, direction] = selectedSort.split('-')
      theList.sort(sortFields[field], { order: direction })

      ForEach(sortCriteriaButtons, (cb) => {
        cb.classList.remove(activeClass)
      })
      event.target.classList.add(activeClass)
    })
  })
}

let buildList = () => {
  let theList = initList()

  initFiltering(theList)
  initSorting(theList)
}

// Full detail view
let buildCard = (data) => {
  const searchSelector = '#js-card-search'
  const cardDetailSelector = '.js-card-detail'
  const hiddenClass = 'is-hidden'

  let updateMeta = (title, description) => {
    let newTitle = htmlEncode.htmlDecode(title)
    let newDescription = htmlEncode.htmlDecode(description)

    document.querySelector('meta[property="og:title"]').setAttribute('content', newTitle)
    document.querySelector('meta[property="og:description"]').setAttribute('content', newDescription)
    document.title = newTitle
    document.description = newDescription
  }

  let openCard = (el, callback) => {
    let cardCallback = () => {
      document.querySelector(cardDetailSelector).classList.remove(hiddenClass)
      document.querySelector(cardDetailSelector).classList.add(activeClass)

      window.scrollTo(0, 0)

      let theId = el.getAttribute('data-id')
      let cardData = Find(data, (c) => {
        return c.id === theId
      })

      let iCanHelpButton = document.querySelector('.js-i-can-help-button')
      iCanHelpButton.addEventListener('click', function (event) {
        event.preventDefault()
        if (cardData.type === 'money') {
          window.location = cardData.donationUrl
        } else {
          browser.scrollTo('.requests-detail__heading--i-can-help')
        }
      })

      let contactFormModel = new ContactFormModel()
      contactFormModel.needId = theId
      ko.applyBindings(contactFormModel, document.querySelector('.requests-detail__form'))

      initFbShare()

      Holder.run({})

      // TODO: Proper URL support
      let state = { test: 'TBA' }
      history.pushState(state, 'TEST', '?id=' + theId)

      ForEach(document.querySelectorAll('.js-card-back'), (link) => {
        link.addEventListener('click', (event) => {
          event.preventDefault()
          callback()
        })
      })

      socialShare.updateSharePageHrefs()
    }

    let initFbShare = () => {
      let el = document.querySelector('.js-fb-share-page')
      el.addEventListener('click', function (e) {
        e.preventDefault()
        var facebookAppID = '244120752609710'
        let url = 'https://www.facebook.com/dialog/feed?app_id=' + facebookAppID +
        '&link=' + encodeURIComponent(window.location.href) +
        '&name=' + encodeURIComponent(document.title) +
        '&description=' + encodeURIComponent(document.description) +
        '&redirect_uri=https://www.facebook.com'
        window.open(url)
      })
    }

    let initCardDetail = () => {
      let theId = el.getAttribute('data-id')
      let cardData = Find(data, (o) => { return o.id === theId })

      cardData.showLocation = cardData.postcode.length > 0 && cardData.type !== 'money'
      cardData.showContactForm = cardData.type !== 'money'

      updateMeta(cardData.description + ' needed for ' + cardData.serviceProviderName, cardData.reason)

      // hide search
      document.querySelector(searchSelector).classList.remove(activeClass)
      document.querySelector(searchSelector).classList.add(hiddenClass)

      // Append object name for Hogan
      let theCardTemplateData = { card: cardData }

      templating.renderTemplate('js-card-detail-tpl', theCardTemplateData, 'js-card-detail-output', cardCallback)
    }

    initCardDetail()
  }

  let openIfCardRequested = () => {
    let cardId = getUrlParams.parameter('id').replace('/', '')
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
    document.querySelector(searchSelector).classList.remove(hiddenClass)
    document.querySelector(searchSelector).classList.add(activeClass)

    document.querySelector(cardDetailSelector).classList.remove(activeClass)
    document.querySelector(cardDetailSelector).classList.add(hiddenClass)

    updateMeta('Requests for Help - Street Support', 'Organisations need specific items, skills and money to support homeless people in Manchester - can you help?')
  }

  let addClickEvents = () => {
    let addEventListener = (card) => {
      card.addEventListener('click', function (event) {
        event.preventDefault()
        openCard(this, rewindHistory)
      })
    }
    ForEach(document.querySelectorAll('.requests-listing__item'), addEventListener)
  }

  window.onpopstate = () => {
    closeCard()
    openIfCardRequested()
  }

  addClickEvents()
  openIfCardRequested()
}

browser.loading()
locationSelector
  .getCurrent()
  .then((result) => {
    init(result)
  }, (_) => {

  })
