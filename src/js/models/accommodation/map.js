const ajaxGet = require('../../get-api-data')
const endpoints = require('../../api')
const browser = require('../../browser')
const querystring = require('../../get-url-parameter')
const locationSelector = require('../../location/locationSelector')

import { Accommodation, TypeFilter } from './types'

const MapBuilder = require('./MapBuilder')

const ko = require('knockout')

const AccommodationListing = function () {
  const self = this

  const buildInfoWindowMarkup = (p) => {
    return `<div class="map-info-window">
        <h1 class="h2">${p.name}</h1>
      </div>`
  }

  self.map = new MapBuilder()
  self.items = ko.observableArray()
  self.selectedTypeFilterName = ko.observable()
  self.itemsToDisplay = ko.computed(() => {
    return self.selectedTypeFilterName() !== undefined && self.selectedTypeFilterName().length > 0 && self.selectedTypeFilterName() !== 'all'
      ? self.items().filter((i) => i.accommodationType() === self.selectedTypeFilterName())
      : self.items()
  }, self)
  self.noItemsAvailable = ko.computed(() => self.itemsToDisplay().length === 0, self)
  self.typeFilters = ko.observableArray()
  self.dataIsLoaded = ko.observable(false)

  self.markerClicked = (mapIndex) => {
    self.itemsToDisplay()
      .forEach((item) => {
        item.isActive(item.mapIndex() === mapIndex)
      })
  }

  self.itemSelected = (item) => {
    self.itemsToDisplay()
      .filter((i) => i.id !== item.id)
      .forEach((i) => i.isActive(false))
  }

  self.typeFilterDropdownSelected = () => {
    const typeFilter = self.typeFilters().find((tf) => tf.typeName() === self.selectedTypeFilterName())
    typeFilter.select()
  }

  //TODO: Fix this, needs a location passing to init
  self.typeFilterSelected = (selectedFilter) => {
    self.typeFilters()
      .filter((tf) => tf.typeName() !== selectedFilter.typeName())
      .forEach((tf) => tf.deselect())
    self.selectedTypeFilterName(selectedFilter.typeName())
    self.init()
  }

  //TODO: We should get the other filters on the map page
  const getFilterQuerystring = function () {
    // let queryString = self.residentCriteriaFilters()
    //   .filter((f) => f.value() !== undefined)
    //   .map((f) => `&${f.dataFieldName()}=${f.value()}`)
    //   .join('')

    let queryString = ''

    if (self.selectedTypeFilterName() !== undefined) {
      queryString += `&accomType=${self.selectedTypeFilterName()}`
    }

    return queryString
  }

  self.init = (currentLocation) => {
    browser.loading()
    const endpoint = `${endpoints.accommodation}?latitude=${currentLocation.latitude}&longitude=${currentLocation.longitude}${getFilterQuerystring()}`
    ajaxGet.data(endpoint)
      .then((result) => {
        let itemsWithCoordinatesSet = result.data.items
        .filter((i) => i.latitude !== 0 && i.longitude !== 0)

        itemsWithCoordinatesSet.forEach((e, i) => {
          e.mapIndex = i
        })

        self.items(itemsWithCoordinatesSet.map((i) => new Accommodation(i, [self.map, self])))

        const types = Array.from(new Set(result.data.items
          .map((i) => i.accommodationType)))
          .filter((i) => i !== null && i.length > 0)
          .map((i) => new TypeFilter(i, [self]))
        const all = new TypeFilter('all', [self], true)
        self.typeFilters([all, ...types])

        self.dataIsLoaded(true)
        browser.loaded()

        self.map.init(itemsWithCoordinatesSet, currentLocation, self, buildInfoWindowMarkup)

        const filterInQs = querystring.parameter('filterId')
        if (filterInQs !== undefined) {
          self.selectedTypeFilterName(filterInQs)
          self.typeFilterDropdownSelected()
        }
      })
  }

  locationSelector
    .getCurrent()
    .then((result) => {
      self.init(result)
    })
}

module.exports = AccommodationListing
