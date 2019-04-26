require('../../arrayExtensions')

import ko from 'knockout'

const ajax = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')
const listToDropdown = require('../../list-to-dropdown')

import { getProvidersForListing } from '../../pages/find-help/provider-listing/helpers'

import FindHelp from './FindHelp'

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
  constructor () {
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
    this.subCatFilters = ko.computed(this.getSubCatFilters, this)

    this.subCatFilters.subscribe(() => {
      listToDropdown.init(
        () => {},
        (event) => {
          this.onSubCatFilterByName(event.target.value)
        }
      )
    })

    this.shouldShowSubCatFilter = ko.computed(() => {
      return this.subCatFilters().length > 1
    }, this)

    const postcodeInQuerystring = querystring.parameter('postcode')
    if (postcodeInQuerystring) {
      this.proximitySearch.postcode(postcodeInQuerystring)
      this.proximitySearch.search()
    }

    if (this.proximitySearch.hasCoords()) {
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
