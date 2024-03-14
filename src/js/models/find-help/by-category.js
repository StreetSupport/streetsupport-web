import ko from 'knockout'
import { getProvidersForListing } from '../../pages/find-help/provider-listing/helpers'
import FindHelp from './FindHelp'

require('../../arrayExtensions')

const ajax = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')
const listToDropdown = require('../../list-to-dropdown')

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

export default class FindHelpByCategory extends FindHelp {
  constructor (pageSize = 25) {
    super([{
      qsKey: 'subCatId',
      getValue: () => {
        const selectedSubCatFilter = this.subCatFilters().find((sc) => sc.isSelected())
        return selectedSubCatFilter
          ? selectedSubCatFilter.id
          : undefined
      }
    }])
    this.allItems = ko.observableArray([])
    this.allOriginalItems = ko.observableArray([])
    this.subCatFilters = ko.computed(this.getSubCatFilters, this)

    this.isLoaded = false
    this.pageSize = pageSize
    this.pageIndex = ko.observable(0)
    this.totalItems = ko.observable(0)
    this.hasMorePages = ko.computed(() => (this.pageIndex() + this.pageSize) < this.totalItems(), this)

    this.shouldShowSubCatFilter = ko.computed(() => {
      return this.subCatFilters().length > 1
    }, this)

    const postcodeInQuerystring = querystring.parameter('postcode')
    if (postcodeInQuerystring) {
      this.proximitySearch.postcode(postcodeInQuerystring)
      this.proximitySearch.search()
    }

    if (this.proximitySearch.hasCoords() && !this.isLoaded) {
      this.onProximitySearch(false)
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
    const subCatIdInQuerystring = querystring.parameter('subCatId')
    if (!subCatIdInQuerystring) {
      this.pushHistory()
    }
    if (isLoadMore !== true) {
      this.pageIndex(0)
    }
    ajax
      .data(`${endpoints.serviceCategories}sorted-by-location?pageSize=${this.pageSize}&latitude=${this.proximitySearch.latitude}&longitude=${this.proximitySearch.longitude}&range=${this.proximitySearch.range()}&index=${this.pageIndex()}&serviceCategoryId=${this.category.categoryId}`)
      .then((result) => {
        if (isLoadMore !== true) {
          this.totalItems(result.data.total)
          this.allOriginalItems([])
        }

        this.allOriginalItems(this.allOriginalItems().concat(result.data.providers))
        this.allItems(getProvidersForListing(this.allOriginalItems()))
        this.items(this.allItems())

        if (subCatIdInQuerystring) {
          this.setSubCatFilter(subCatIdInQuerystring)
        }

        listToDropdown.init(
          () => {},
          (event) => {
            this.onSubCatFilterByName(event.target.value)
          }
        )

        browser.loaded()
      })
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

  onSubCatFilterByName (subCatName) {
    const subCatId = this.subCatFilters().find((sc) => sc.name === subCatName).id
    this.onSubCatFilter(subCatId)
  }

  onBrowserHistoryBack (thisDoobrey, e) {
    this.setSubCatFilter(e.state.subCatId)
    if (e.state && e.state.postcode !== thisDoobrey.proximitySearch.postcode()) {
      thisDoobrey.proximitySearch.postcode(e.state.postcode)
      thisDoobrey.proximitySearch.search()
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

  setSubCatFilter (subCatId) {
    const selectedSubCatFilter = this.subCatFilters()
      .find((sc) => sc.id === subCatId)

    if (selectedSubCatFilter) {
      selectedSubCatFilter.filter()
    }
  }
}
