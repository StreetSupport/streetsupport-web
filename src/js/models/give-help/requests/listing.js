const ko = require('knockout')

const api = require('../../../get-api-data')
const browser = require('../../../browser')
const endpoints = require('../../../api')
const location = require('../../../location/locationSelector')
const postcodeLookup = require('../../../location/postcodes')
const proximityRanges = require('../../../location/proximityRanges')

import { formatNeedsKO } from './needs'
import { getKOSortAscFunc, getKOSortDescFunc } from '../../../sorting'

class NeedsListing {
  constructor () {
    this.ranges = ko.observableArray(proximityRanges.ranges)
    this.range = ko.observable(proximityRanges.defaultRange)
    this.postcode = ko.observable()
    this.allNeeds = ko.observableArray()
    this.filters = ko.observableArray([
      { isActive: ko.observable(true), filterAction: () => this.clearFilter(), filterFunction: () => true, label: 'All' },
      { isActive: ko.observable(false), filterAction: () => this.filterForItems(), filterFunction: (n) => n.type() === 'items', label: 'Items' },
      { isActive: ko.observable(false), filterAction: () => this.filterForTime(), filterFunction: (n) => n.type() === 'time', label: 'Time' },
      { isActive: ko.observable(false), filterAction: () => this.filterForMoney(), filterFunction: (n) => n.type() === 'money', label: 'Money' }
    ])
    this.currentFilter = ko.observable(this.filters().find((f) => f.label === 'All').filterFunction)
    this.sorts = ko.observableArray([
      { isActive: ko.observable(true), sortAction: () => this.sortByDateAdded(), sortFunction: getKOSortDescFunc('neededDate'), label: 'Date Added' },
      { isActive: ko.observable(false), sortAction: () => this.sortByOrganisation(), sortFunction: getKOSortAscFunc('serviceProviderName'), label: 'Organisation' },
      { isActive: ko.observable(false), sortAction: () => this.sortByDistance(), sortFunction: getKOSortAscFunc('distanceAwayInMetres'), label: 'Distance' }
    ])
    this.currentSort = ko.observable(this.sorts().find((f) => f.label === 'Date Added').sortFunction)
    this.isMoreToLoad = ko.observable(false)
    this.currentPageLinks = {}

    this.hasPostcode = ko.computed(() => this.postcode() !== undefined && this.postcode().length, this)
    this.needsToDisplay = ko.computed(() => this.allNeeds().filter(this.currentFilter()).sort(this.currentSort()), this)
    this.hasNeeds = ko.computed(() => this.needsToDisplay().length > 0, this)

    location.getPreviouslySetPostcode()
      .then((locationResult) => {
        if (locationResult) {
          this.locationResult = locationResult
          this.postcode(this.locationResult.postcode)
          this.loadNeeds(this.firstPageUrl)
        }
      })
  }

  loadNextPage () {
    this.loadNeeds(endpoints.getFullUrl(this.currentPageLinks.next))
  }

  search () {
    this.allNeeds([])
    postcodeLookup.getCoords(
      this.postcode(),
      (result) => {
        this.locationResult = result
        this.loadNeeds(this.firstPageUrl)
        location.setPostcode(this.postcode())
      },
      () => {
        browser.redirect('/500')
      })
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
        
      browser.pushHistory({}, `Give ${reqFilter}`, browser.location().pathname + '#' + reqFilter)
      filter.isActive(true)
      this.currentFilter(filter.filterFunction)
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
    this.currentSort(sort.sortFunction)
  }

  loadNeeds (url) {
    browser.loading()
    api
      .data(url)
      .then((result) => {
        this.currentPageLinks = result.data.links
        this.allNeeds([...this.allNeeds(), ...formatNeedsKO(result.data.items, this.locationResult)])
        this.isMoreToLoad(result.data.links.next)
        
        if(browser.location().hash) {
          console.log(browser.location().hash)
          this.setActiveFilter(browser.location().hash.substring(1))
        }

        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  get firstPageUrl () {
    const qsParts = {
      'latitude': this.locationResult.latitude,
      'longitude': this.locationResult.longitude,
      'pageSize': 21,
      'range': this.range()
    }
    const qs = Object.keys(qsParts)
      .map((k) => `${k}=${qsParts[k]}`)
      .join('&')

    return `${endpoints.needsHAL}?${qs}`
  }
}

module.exports = NeedsListing
