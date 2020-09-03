require('../../../arrayExtensions')

import ko from 'knockout'

const ajax = require('../../../get-api-data')
const browser = require('../../../browser')
const endpoints = require('../../../api')
const querystring = require('../../../get-url-parameter')
const listToDropdown = require('../../../list-to-dropdown')

import { getProvidersForListing } from '../../../pages/find-help/provider-listing/helpers'
import FindHelp from './FindHelp'

class CatFilter {
  constructor (data, container) {
    this.id = data.categoryId
    this.name = data.categoryName
    this.container = container
    this.isSelected = ko.observable(false)
  }

  filter () {
    this.isSelected(!this.isSelected())
    this.container.onCatFilter(this.id)
  }

  filterOnCheck () {
    this.container.onCatFilter(this.id)

    return true
  }
}

export default class FindHelpByClientGroup extends FindHelp {
  constructor (pageSize = 25) {
    super([{
      qsKey: 'catIds',
      getValue: () => {
        const selectedCatFilters = this.catFilters().filter((c) => c.id !== undefined && c.isSelected()).map((c) => c.id)
        return selectedCatFilters && selectedCatFilters.length
          ? selectedCatFilters.join(',')
          : undefined
      }
    }])

    this.allItems = ko.observableArray([])
    this.allOriginalItems = ko.observableArray([])
    this.isLoaded = false
    this.pageSize = pageSize
    this.pageIndex = ko.observable(0)
    this.totalItems = ko.observable(0)
    this.hasMorePages = ko.computed(() => (this.pageIndex() + this.pageSize) < this.totalItems(), this)
    this.catFilters = ko.computed(this.getCatFilters, this)

    // TODO: Rewrite when we get new mobile design
    // this.catFilters.subscribe(() => {
    //   listToDropdown.init(
    //     () => {},
    //     (event) => {
    //       this.onCatFilterByName(event.target.value)
    //     }
    //   )
    // })

    this.shouldShowCatFilter = ko.computed(() => {
      return this.catFilters().length > 1
    }, this)

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
    this.onProximitySearch(true)
  }

  onProximitySearch (isLoadMore = false) {
    this.isLoaded = true
    browser.loading()
    const catIdsInQuerystring = querystring.parameter('catIds')

    if (!catIdsInQuerystring) {
      this.pushHistory()
    }
    if (isLoadMore !== true) {
      this.pageIndex(0)
    }
    ajax
      .data(`${endpoints.serviceCategories}${this.proximitySearch.latitude}/${this.proximitySearch.longitude}?range=${this.proximitySearch.range()}&pageSize=${this.pageSize}&index=${this.pageIndex()}&clientGroup=${this.encodeClientGroupKey(this.clientGroup.clientGroupKey)}&catIds=employment&subCatIds=paid`)
      .then((result) => {
        if (isLoadMore !== true) {
          this.totalItems(result.data.total)
          this.allOriginalItems([])
        }

        this.allOriginalItems(this.allOriginalItems().concat(result.data.providers))
        this.allItems(getProvidersForListing(this.allOriginalItems()))
        this.items(this.allItems())

        if (catIdsInQuerystring) {
          this.setCatFilter(catIdsInQuerystring)
        }

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

  onCatFilter (catId) {
    if (!catId) {
      this.catFilters()
      .forEach((c) => c.isSelected(this.catFilters().find((f) => c.categoryId === undefined).isSelected()))
    }
    else {
      if (this.catFilters().filter((f) => f.id !== undefined).every((e) => e.isSelected() === true)) {
        this.catFilters().find((f) => f.id === undefined).isSelected(true)
      }
      else {
         this.catFilters().find((f) => f.id === undefined).isSelected(false)
      }
    }

    const filtered = catId !== undefined
                ? this.allItems().filter((i) => i.services.find((c) => this.catFilters().find((f) => c.categoryId === f.id).isSelected()))
                : this.allItems().filter((i) => i.services.find((c) => this.catFilters().find((f) => undefined === f.id).isSelected()))
    this.items(filtered)
    this.pushHistory()
  }

  // TODO: Rewrite when we get new mobile designv
  // onCatFilterByName (catName) {
  //   const catId = this.catFilters().find((c) => c.name === catName).id
  //   this.onCatFilter(catId)
  // }

  getCatFilters () {
    const toFlatCatList = (acc, next) => {
      const newCatFilters = next.services
        .map((c) => new CatFilter(c, this))
      return [...acc, ...newCatFilters]
    }

    const toDistinct = (acc, next) => {
      return (!acc.find((c) => c.id === next.id))
        ? [...acc, next]
        : acc
    }

    const showAll = new CatFilter({ categoryName: 'Show All', isSelected: false }, this)

    const cats = [showAll, ...this.allItems()
      .reduce(toFlatCatList, [])
      .reduce(toDistinct, [])
      .sortAsc('name')]

      if (cats.length > 1 && !querystring.parameter('catIds')) {
        cats[1].isSelected(true)
      }

    return cats
  }

  setCatFilter (catIds) {
    var listIds = catIds.split(',')
    const selectedCatFilters = this.catFilters()
      .filter((c) => listIds.some((i) => i === c.id))

      if (selectedCatFilters) {
        selectedCatFilters.forEach((f) => f.filter());
      }
  }
}
