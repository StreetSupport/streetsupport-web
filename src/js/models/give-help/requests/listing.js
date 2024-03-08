import { formatNeedsKO } from './needs'
import { getKOSortAscFunc, getKOSortDescFunc } from '../../../sorting'
import ProximitySearch from '../../ProximitySearch'
import pushHistory from '../../../history'

const ko = require('knockout')
const api = require('../../../get-api-data')
const browser = require('../../../browser')
const endpoints = require('../../../api')
const querystring = require('../../../get-url-parameter')

class NeedsListing {
  constructor () {
    this.proximitySearch = new ProximitySearch(this)

    this.allNeeds = ko.observableArray()
    this.filters = ko.observableArray([
      { isActive: ko.observable(true), filterAction: () => this.clearFilter(), filterFunction: () => true, label: 'All' },
      { isActive: ko.observable(false), filterAction: () => this.filterForItems(), filterFunction: (n) => n.type() === 'items', label: 'Items' },
      { isActive: ko.observable(false), filterAction: () => this.filterForTime(), filterFunction: (n) => n.type() === 'time', label: 'Time' },
      { isActive: ko.observable(false), filterAction: () => this.filterForMoney(), filterFunction: (n) => n.type() === 'money', label: 'Money' }
    ])
    this.currentFilterFunction = ko.observable(this.filters().find((f) => f.label === 'All').filterFunction)
    this.sorts = ko.observableArray([
      { isActive: ko.observable(true), sortAction: () => this.sortByDateAdded(), sortFunction: getKOSortDescFunc('neededDate'), label: 'Date Added' },
      { isActive: ko.observable(false), sortAction: () => this.sortByOrganisation(), sortFunction: getKOSortAscFunc('serviceProviderName'), label: 'Organisation' },
      { isActive: ko.observable(false), sortAction: () => this.sortByDistance(), sortFunction: getKOSortAscFunc('distanceAwayInMetres'), label: 'Distance' }
    ])
    this.currentSortFunction = ko.observable(this.sorts().find((f) => f.label === 'Date Added').sortFunction)
    this.isMoreToLoad = ko.observable(false)
    this.currentPageLinks = {}

    this.hasPostcode = ko.computed(() => this.proximitySearch.postcode() !== undefined && this.proximitySearch.postcode().length, this)
    this.priorityNeeds = ko.computed(() => this.allNeeds().filter((n) => n.isPriority()))
    this.nonPriorityNeeds = ko.computed(() => this.allNeeds().filter((n) => !n.isPriority()))
    this.needsToDisplay = ko.computed(() => [...this.priorityNeeds(), ...this.nonPriorityNeeds().filter(this.currentFilterFunction()).sort(this.currentSortFunction())], this)
    this.hasNeeds = ko.computed(() => this.needsToDisplay().length > 0, this)

    const postcodeInQuerystring = querystring.parameter('postcode')
    if (postcodeInQuerystring) {
      this.proximitySearch.postcode(postcodeInQuerystring)
      this.proximitySearch.search()
    } else if (this.proximitySearch.hasCoords()) {
      this.onProximitySearch()
    }

    browser.setOnHistoryPop((e) => {
      this.onBrowserHistoryBack(this, e)
    })
  }

  loadNextPage () {
    this.loadNeeds(endpoints.getFullUrl(this.currentPageLinks.next))
  }

  onProximitySearch () {
    if (querystring.parameter('type')) {
      this.setActiveFilter(querystring.parameter('type'))
    }

    this.allNeeds([])
    this.loadNeeds(this.firstPageUrl)

    this.pushHistory()
  }

  onProximitySearchFail (error) {
    console.log(error)
    browser.redirect('/500')
  }

  onBrowserHistoryBack (thisDoobrey, e) {
    if (e.state) {
      this.setActiveFilter(e.state.type)
      if (e.state.postcode !== thisDoobrey.proximitySearch.postcode()) {
        thisDoobrey.proximitySearch.postcode(e.state.postcode)
        thisDoobrey.proximitySearch.search()
      }
    }
  }

  pushHistory () {
    pushHistory([
      { qsKey: 'postcode', getValue: () => this.proximitySearch.postcode() },
      {
        qsKey: 'type',
        getValue: () => {
          const activeFilter = this.filters().find((f) => f.isActive())
          return activeFilter
            ? activeFilter.label
            : null
        }
      }
    ])
  }

  filterForItems () {
    this.setActiveFilter('Items')
  }

  filterForTime () {
    this.setActiveFilter('Time')
  }

  filterForMoney () {
    this.setActiveFilter('Money')
  }

  clearFilter () {
    this.setActiveFilter('All')
  }

  setActiveFilter (reqFilter) {
    const filter = this.filters().find((f) => f.label === reqFilter)

    if (filter) {
      this.filters()
        .filter((f) => f.label !== reqFilter)
        .forEach((f) => f.isActive(false))

      filter.isActive(true)
      this.currentFilterFunction(filter.filterFunction)
      this.pushHistory()
    }
  }

  sortByOrganisation () {
    this.setActiveSort('Organisation')
  }

  sortByDistance () {
    this.setActiveSort('Distance')
  }

  sortByDateAdded () {
    this.setActiveSort('Date Added')
  }

  setActiveSort (reqSort) {
    this.sorts()
      .filter((f) => f.label !== reqSort)
      .forEach((f) => f.isActive(false))
    const sort = this.sorts().find((f) => f.label === reqSort)
    sort.isActive(true)
    this.currentSortFunction(sort.sortFunction)
  }

  loadNeeds (url) {
    browser.loading()
    api
      .data(url)
      .then((result) => {
        this.currentPageLinks = result.data.links
        this.allNeeds([...this.allNeeds(), ...formatNeedsKO(result.data.items, { latitude: this.proximitySearch.latitude, longitude: this.proximitySearch.longitude })])
        this.isMoreToLoad(result.data.links.next)

        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  get firstPageUrl () {
    const qsParts = {
      latitude: this.proximitySearch.latitude,
      longitude: this.proximitySearch.longitude,
      pageSize: 25,
      range: this.proximitySearch.range()
    }
    const qs = Object.keys(qsParts)
      .map((k) => `${k}=${qsParts[k]}`)
      .join('&')

    return `${endpoints.needs}?${qs}`
  }
}

module.exports = NeedsListing
