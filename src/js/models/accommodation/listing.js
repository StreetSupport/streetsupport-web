const ajaxGet = require('../../get-api-data')
const endpoints = require('../../api')
const browser = require('../../browser')
const locationSelector = require('../../location/locationSelector')

const MapBuilder = require('./MapBuilder')

const ko = require('knockout')

const toUnique = (acc, name) => {
  const match = acc.find((sc) => sc === name)
  return match === undefined
  ? [...acc, name]
  : acc
}

const TypeFilter = function (name, listeners, isSelected = false) {
  this.listeners = listeners
  this.typeName = ko.observable(name)
  this.isSelected = ko.observable(isSelected)
  this.select = () => {
    this.isSelected(true)
    this.listeners.forEach((l) => l.typeFilterSelected(this))
  }
  this.deselect = () => {
    this.isSelected(false)
  }
}

const Accommodation = function (data, listeners) {
  const self = this

  const mapAddress = (data) => {
    const parts = ['street1', 'street2', 'street3', 'city']
    const result = parts
      .map((p) => data[p])
      .filter((p) => p && p !== undefined && p.length > 0)
      .join(', ')
    return `${result}. ${data.postcode}`
  }

  self.mapIndex = ko.observable(data.mapIndex)
  self.mapIndexToDisplay = ko.observable(data.mapIndex + 1)
  self.id = ko.observable(data.id)
  self.name = ko.observable(data.name)
  self.latitude = ko.observable(data.latitude)
  self.longitude = ko.observable(data.longitude)
  self.address = ko.observable(mapAddress(data))
  self.additionalInfo = ko.observable(data.additionalInfo)
  self.isOpenAccess = ko.observable(data.isOpenAccess)
  self.accommodationType = ko.observable(data.accommodationType)
  self.detailsUrl = ko.observable(`details?id=${data.id}`)
  self.isActive = ko.observable()

  self.selectItem = () => {
    self.isActive(true)
    listeners
      .forEach((l) => l.itemSelected(self))
  }
}

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

        const types = result.data.items
          .map((i) => i.accommodationType)
          .reduce(toUnique, [])
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
