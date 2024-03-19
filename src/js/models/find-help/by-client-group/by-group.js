import ko from 'knockout'
import { getProvidersForListing } from '../../../pages/find-help/provider-listing/helpers'
import FindHelp from './FindHelp'
import { categories } from '../../../../data/generated/service-categories'

require('../../../arrayExtensions')

const ajax = require('../../../get-api-data')
const browser = require('../../../browser')
const endpoints = require('../../../api')
const querystring = require('../../../get-url-parameter')
const listToDropdown = require('../../../list-to-dropdown')

class CatFilter {
  constructor (data, container) {
    this.id = data.key
    this.name = data.name
    this.container = container
    this.isSelected = ko.observable(false)
    this.subCategories = ko.observableArray(data.subCategories ? data.subCategories.map((sc) => new SubCatFilter(sc)) : [])
  }

  filter (isInit = false) {
    // If is isInit == true it means we load page first time and we need to set selected categories to TRUE.
    this.isSelected(isInit === true ? true : !this.isSelected())
    this.setSubcategories()
    this.container.onCatFilter(this.id, isInit === true)
  }

  filterMobile () {
    this.isSelected(true)
    this.setSubcategories()
    this.container.onCatMobileFilter(this.id)
  }

  filterOnCheck () {
    this.setSubcategories()
    this.container.onCatFilter(this.id)
    return true
  }

  setSubcategories () {
    this.subCategories().forEach((x) => {
      x.isSelected(this.isSelected())
    })
  }
}

class SubCatFilter {
  constructor (data) {
    this.id = data.key
    this.name = data.name
    this.isSelected = ko.observable(false)
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
    },
    {
      qsKey: 'subCatIds',
      getValue: () => {
        var categories = this.catFilters().filter((c) => c.id !== undefined && c.isSelected())
        if (categories && categories.length) {
          const selectedSubCatFilters = categories.map((c) => c.subCategories())
            .reduce(function (a, b) {
              return a.concat(b.filter((sc) => sc.isSelected()))
            })
            .map((sc) => sc.id)
          return selectedSubCatFilters && selectedSubCatFilters.length
            ? selectedSubCatFilters.join(',')
            : undefined
        }
        return undefined
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

    this.shouldShowCatFilter = ko.computed(() => {
      return this.catFilters().length > 1
    }, this)

    const postcodeInQuerystring = querystring.parameter('postcode')
    if (postcodeInQuerystring) {
      this.proximitySearch.postcode(postcodeInQuerystring)
      this.proximitySearch.search()
    }

    if (this.proximitySearch.hasCoords() && !this.isLoaded) {
      this.onProximitySearch(false, true)
    }

    browser.setOnHistoryPop((e) => {
      this.onBrowserHistoryBack(this, e)
    })
  }

  loadMore () {
    this.pageIndex(this.pageIndex() + this.pageSize)
    this.onProximitySearch(true, false)
  }

  clearCategoriesFilter () {
    this.catFilters().forEach((x) => {
      x.isSelected(false)
      x.setSubcategories()
    })
  }

  initMoblileDropdown () {
    listToDropdown.init(
      () => {},
      (event) => {
        this.onCatFilterByName(event.target.value)
      }
    )
  }

  onProximitySearch (isLoadMore, isInit) {
    // We have static list of filter-categories. As result we need to initialize it once.
    if (!this.isLoaded) {
      this.initMoblileDropdown()
    }

    this.isLoaded = true
    browser.loading()
    var catIdsInQuerystring = querystring.parameter('catIds')
    var subCatIdsInQuerystring = querystring.parameter('subCatIds')
    var isEmptyQuery = false

    // If isInit == true it means we load page first time and need to get url parameters.
    if (isInit && this.catFilters().length > 1 && !catIdsInQuerystring) {
      this.catFilters().forEach((x) => {
        x.isSelected(true)
        x.setSubcategories()
      })

      this.pushHistory()
      catIdsInQuerystring = querystring.parameter('catIds')
      subCatIdsInQuerystring = querystring.parameter('subCatIds')
      isEmptyQuery = true
    } else if (!catIdsInQuerystring) {
      this.pushHistory()
      isEmptyQuery = true
    }

    if (isLoadMore !== true) {
      this.pageIndex(0)
    }

    ajax
      .data(`${endpoints.serviceCategories}by-client-group?pageSize=${this.pageSize}&latitude=${this.proximitySearch.latitude}&longitude=${this.proximitySearch.longitude}&range=${this.proximitySearch.range()}&index=${this.pageIndex()}&clientGroup=${this.encodeClientGroupKey(this.clientGroup.clientGroupKey)}&catIds=${catIdsInQuerystring}&subCatIds=${subCatIdsInQuerystring}`)
      .then((result) => {
        if (isLoadMore !== true) {
          this.totalItems(result.data.total)
          this.allOriginalItems([])
        }

        this.allOriginalItems(this.allOriginalItems().concat(result.data.providers))
        this.allItems(getProvidersForListing(this.allOriginalItems()))
        this.items(this.allItems())

        if (isInit && !isEmptyQuery) {
          this.setCatFilter(catIdsInQuerystring)
        }

        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  onBrowserHistoryBack (thisDoobrey, e) {
    if (e.state && e.state) {
      this.clearCategoriesFilter()
      this.setCatFilter(e.state.catIds)
    }

    if (e.state && e.state.postcode !== thisDoobrey.proximitySearch.postcode()) {
      this.proximitySearch.postcode(e.state.postcode)
      this.proximitySearch.search()
    }
  }

  onCatFilter (catId, isInit = false) {
    if (!catId) {
      this.catFilters()
        .forEach((c) => {
          c.isSelected(this.catFilters().find((f) => c.categoryId === undefined).isSelected())
          c.setSubcategories()
        })
    } else {
      if (this.catFilters().filter((f) => f.id !== undefined).every((e) => e.isSelected() === true)) {
        this.catFilters().find((f) => f.id === undefined).isSelected(true)
      } else {
        this.catFilters().find((f) => f.id === undefined).isSelected(false)
      }
    }

    this.pushHistory()

    // If isInit == true it means we have just called onProximitySearch() and we don't need to call onProximitySearch() again.
    if (!isInit) {
      this.onProximitySearch(false, false)
    }
  }

  onCatFilterByName (catName) {
    const category = this.catFilters().find((c) => c.name === catName.trim())
    category.filterMobile()
  }

  onCatMobileFilter (catId) {
    const isSelected = !(catId !== undefined)
    this.catFilters()
      .filter((c) => c.id !== catId)
      .forEach((c) => c.isSelected(isSelected))
    this.pushHistory()
    this.onProximitySearch(false, false)
  }

  getCatFilters () {
    const showAll = new CatFilter({ name: 'Show All', isSelected: false }, this)
    const cats = [showAll, ...categories.map((c) => new CatFilter(c, this)).sortAsc('name')]
    return cats
  }

  setCatFilter (catIds) {
    var listIds = catIds.split(',')
    const selectedCatFilters = this.catFilters()
      .filter((c) => listIds.some((i) => i === c.id))
    if (selectedCatFilters) {
      selectedCatFilters.forEach((f) => f.filter(true))
    }
  }
}
