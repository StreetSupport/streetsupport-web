require('../../arrayExtensions')

import ko from 'knockout'

const ajax = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')

import { getProvidersForListing } from '../../pages/find-help/provider-listing/helpers'
import ProximitySearch from '../ProximitySearch'
import FindHelpCategory from './FindHelpCategory'

class SubCatFilter {
  constructor (data, container) {
    this.id = data.id
    this.name = data.name
    this.container = container
    this.isSelected = ko.observable(data.isSelected | false)
  }

  filter () {
    this.isSelected(!this.isSelected())
    this.container.onSubCatFilter(this.id)
  }
}

export default class FindHelpByCategory {
  constructor () {
    this.category = new FindHelpCategory()
    const postcodeInQuerystring = querystring.parameter('postcode')
    this.proximitySearch = new ProximitySearch(this, postcodeInQuerystring)
    this.allItems = ko.observableArray([])
    this.items = ko.observableArray([])
    this.subCatFilters = ko.computed(this.getSubCatFilters, this)
    this.hasItems = ko.computed(() => this.items().length > 0, this)

    this.shouldShowSubCatFilter = ko.computed(() => {
      return this.subCatFilters().length > 1
    }, this)

    if (postcodeInQuerystring) {
      this.proximitySearch.postcode(postcodeInQuerystring)
      this.proximitySearch.search()
    }

    if (this.proximitySearch.latitude !== null &&
      this.proximitySearch.longitude !== null &&
      this.proximitySearch.latitude !== undefined &&
      this.proximitySearch.longitude !== undefined) {
      this.onProximitySearch()
    }

    browser.setOnHistoryPop((e) => {
      this.onBrowserHistoryBack(this, e)
    })
  }

  onProximitySearch () {
    browser.loading()
    const subCatIdInQuerystring = querystring.parameter('subCatId')
    if (!subCatIdInQuerystring) {
      this.pushHistory()
    }
    ajax
      .data(`${endpoints.serviceCategories}${this.category.categoryId}/${this.proximitySearch.latitude}/${this.proximitySearch.longitude}?range=${this.proximitySearch.range()}`)
      .then((result) => {
        this.allItems(getProvidersForListing(result.data.providers))
        this.items(this.allItems())

        if (subCatIdInQuerystring) {
          this.setSubCatFilter(subCatIdInQuerystring)
        }

        browser.loaded()
      })
  }

  onProximitySearchFail () {
    window.alert('Sorry, your postcode could not be found. Please try a different, nearby postcode. Alternatively, you can use just the first portion eg: "M1".')
  }

  onSubCatFilter (subCatId) {
    this.subCatFilters()
      .filter((sc) => sc.id !== subCatId)
      .forEach((sc) => sc.isSelected(false))
    const filtered = subCatId !== undefined
      ? this.allItems()
        .filter((i) => i.subCategories.find((sc) => sc.id === subCatId))
      : this.allItems()
    this.items(filtered)
    this.pushHistory()
  }

  onBrowserHistoryBack (thisDoobrey, e) {
    this.setSubCatFilter(e.state.subCatId)
    if (e.state && e.state.postcode !== thisDoobrey.proximitySearch.postcode()) {
      thisDoobrey.proximitySearch.postcode(e.state.postcode)
      thisDoobrey.proximitySearch.search()
    }
  }

  pushHistory () {
    const postcodeqs = querystring.parameter('postcode')
    const subCatIdqs = querystring.parameter('subCatId')

    const postcode = this.proximitySearch.postcode()
    const selectedSubCatFilter = this.subCatFilters().find((sc) => sc.isSelected())

    const subCatId = selectedSubCatFilter
      ? selectedSubCatFilter.id
      : undefined

    if (postcode !== postcodeqs || subCatId !== subCatIdqs) {
      const kvps = [
        { key: 'postcode', value: postcode },
        { key: 'subCatId', value: subCatId }
      ]
        .filter((kv) => kv.value !== undefined)

      const qs = kvps
        .map((kv) => `${kv.key}=${kv.value}`)
        .join('&')

      const history = {}
      kvps
        .forEach((kvp) => {
          history[kvp.key] = kvp.value
        })

      const newUrl = `?${qs}`
      browser.pushHistory(history, '', newUrl)
    }
  }

  getSubCatFilters () {
    const toFlatSubCatList = (acc, next) => {
      const newSubCatFilters = next.subCategories
        .map((sc) => new SubCatFilter(sc, this))
      return [...acc, ...newSubCatFilters]
    }

    const toDistinct = (acc, next) => {
      return (!acc.find((sc) => sc.id === next.id))
        ? [...acc, next]
        : acc
    }

    const showAll = new SubCatFilter({ name: 'Show All', isSelected: true }, this)

    const subCats = [showAll, ...this.allItems()
      .reduce(toFlatSubCatList, [])
      .reduce(toDistinct, [])
      .sortAsc('name')]

    return subCats
  }

  setSubCatFilter(subCatId) {
    const selectedSubCatFilter = this.subCatFilters()
      .find((sc) => sc.id === subCatId)

    if (selectedSubCatFilter) {
      selectedSubCatFilter.filter()
    }
  }
}
