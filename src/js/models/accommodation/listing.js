const ajaxGet = require('../../get-api-data')
const endpoints = require('../../api')
const browser = require('../../browser')
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
    return self.selectedTypeFilterName() !== undefined && self.selectedTypeFilterName() !== 'all'
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

  self.typeFilterSelected = (selectedFilter) => {
    self.typeFilters()
      .filter((tf) => tf.typeName() !== selectedFilter.typeName())
      .forEach((tf) => tf.deselect())
    self.selectedTypeFilterName(selectedFilter.typeName())
    self.map.update(self.itemsToDisplay()
      .map((i) => {
        return {
          name: i.name(),
          mapIndex: i.mapIndex(),
          latitude: i.latitude(),
          longitude: i.longitude()
        }
      }))
  }

  self.init = (currentLocation) => {
    browser.loading()
    ajaxGet.data(`${endpoints.accommodation}?latitude=${currentLocation.latitude}&longitude=${currentLocation.longitude}`)
      .then((result) => {
        result.data.items
          .forEach((e, i) => {
            e.mapIndex = i
          })

        self.items(result.data.items.map((i) => new Accommodation(i, [self.map, self])))

        const types = Array.from(new Set(result.data.items
          .map((i) => i.accommodationType)))
          .map((i) => new TypeFilter(i, [self]))
        const all = new TypeFilter('all', [self], true)
        self.typeFilters([all, ...types])

        self.dataIsLoaded(true)
        browser.loaded()

        self.map.init(result.data.items, currentLocation, self, buildInfoWindowMarkup)
      })
  }

  locationSelector
    .getCurrent()
    .then((result) => {
      self.init(result)
    })
}

module.exports = AccommodationListing
