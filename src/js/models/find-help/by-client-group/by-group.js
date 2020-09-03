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
    this.pushHistory()

    ajax
      .data(`${endpoints.serviceCategories}${this.proximitySearch.latitude}/${this.proximitySearch.longitude}?range=${this.proximitySearch.range()}&pageSize=${this.pageSize}&index=${this.pageIndex()}&clientGroup=${this.encodeClientGroupKey(this.clientGroup.clientGroupKey)}`)
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
