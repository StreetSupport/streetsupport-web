require('../../../arrayExtensions')

import ko from 'knockout'

const ajax = require('../../../get-api-data')
const browser = require('../../../browser')
const endpoints = require('../../../api')
const querystring = require('../../../get-url-parameter')

import { getProvidersForListing } from '../../../pages/find-help/provider-listing/helpers'
import FindHelpByClientGroup from './FindHelpByClientGroup'

export default class FindHelpByCategory extends FindHelpByClientGroup {
  constructor (pageSize = 25) {
    super()

    this.allItems = ko.observableArray([])
    this.allOriginalItems = ko.observableArray([])
    // this.clientGroupKey = ko.observable()
    // this.clientGroupName = ko.observable()
    this.isLoaded = false
    this.pageSize = pageSize
    this.pageIndex = ko.observable(0)
    this.totalItems = ko.observable(0)
    this.hasMorePages = ko.computed(() => (this.pageIndex() + this.pageSize) < this.totalItems(), this)

    const postcodeInQuerystring = querystring.parameter('postcode')
    if (postcodeInQuerystring) {
      this.proximitySearch.postcode(postcodeInQuerystring)
      this.proximitySearch.search()
    }

    if (this.proximitySearch.hasCoords() && !this.isLoaded) {
      this.onProximitySearch()
    }

    browser.setOnHistoryPop((e) => {
      this.onBrowserHistoryBack(this, e)
    })
  }

  loadMore () {
    this.pageIndex(this.pageIndex() + this.pageSize)
    this.onProximitySearch()
  }

  onProximitySearch () {
    this.isLoaded = true
    browser.loading()
    // this.clientGroupKey(querystring.parameter('key'))

    // this.listingHref(`/find-help/by-client-group/?key=${querystring.parameter('key')}&postcode=${this.proximitySearch.postcode()}`)
    // this.timetableHref(`/find-help/by-client-group/timetable/?key=${querystring.parameter('key')}&postcode=${this.proximitySearch.postcode()}`)
    // this.mapHref(`/find-help/by-client-group/map/?key=${querystring.parameter('key')}&postcode=${this.proximitySearch.postcode()}`)

    this.pushHistory()

    ajax
      .data(`${endpoints.serviceCategories}${this.proximitySearch.latitude}/${this.proximitySearch.longitude}?range=${this.proximitySearch.range()}&pageSize=${this.pageSize}&index=${this.pageIndex()}&clientGroup=${this.category.key}`)
      .then((result) => {
        if (this.totalItems() === 0) {
          this.totalItems(result.data.total)
        }
        this.allOriginalItems(this.allOriginalItems().concat(result.data.providers))
        this.allItems(getProvidersForListing(this.allOriginalItems()))
        this.items(this.allItems())

        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  onBrowserHistoryBack (thisDoobrey, e) {
    if (e.state && e.state.postcode !== thisDoobrey.proximitySearch.postcode()) {
      this.proximitySearch.postcode(e.state.postcode)
      this.proximitySearch.search()
    }
  }
}
