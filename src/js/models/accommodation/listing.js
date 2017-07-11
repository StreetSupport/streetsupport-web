const ajaxGet = require('../../get-api-data')
const endpoints = require('../../api')
const browser = require('../../browser')
const querystring = require('../../get-url-parameter')
const locationSelector = require('../../location/locationSelector')

import { Accommodation, TypeFilter } from './types'
import { getCoords } from '../../location/postcodes'
import * as storage from '../../storage'

const ko = require('knockout')

const SearchFilter = function (dataFieldName, labelText) {
  const self = this
  self.dataFieldName = ko.observable(dataFieldName)
  self.labelText = ko.observable(labelText)
  self.value = ko.observable()
}

const AccommodationListing = function () {
  const self = this

  self.items = ko.observableArray()
  self.selectedTypeFilterName = ko.observable('all')
  self.itemsToDisplay = ko.computed(() => {
    return self.selectedTypeFilterName() !== undefined && self.selectedTypeFilterName().length > 0 && self.selectedTypeFilterName() !== 'all'
      ? self.items().filter((i) => i.accommodationType() === self.selectedTypeFilterName())
      : self.items()
  }, self)
  self.noItemsAvailable = ko.computed(() => self.itemsToDisplay().length === 0, self)
  self.typeFilters = ko.observableArray()
  self.dataIsLoaded = ko.observable(false)
  self.locationName = ko.observable()

  self.itemSelected = (item) => {
    self.itemsToDisplay()
      .filter((i) => i.id !== item.id)
      .forEach((i) => i.isActive(false))
  }

  self.selectedTypeFilterName.subscribe(function (newValue) {
    const typeFilter = self.typeFilters().find((tf) => tf.typeName() === newValue)
    typeFilter.select()
  })

  self.typeFilterSelected = (selectedFilter) => {
    self.typeFilters()
      .filter((tf) => tf.typeName() !== selectedFilter.typeName())
      .forEach((tf) => tf.deselect())
    self.selectedTypeFilterName(selectedFilter.typeName())
    browser.pushHistory({}, `${selectedFilter.typeName()} Accommodation - Street Support`, `?filterId=${selectedFilter.typeName()}`)
  }

  self.displayFilter = ko.observable(false)
  self.toggleFilterDisplay = () => {
    self.displayFilter(!self.displayFilter())
  }

  self.residentCriteriaFilters = ko.observableArray([
    new SearchFilter('acceptsMen', 'Men'),
    new SearchFilter('acceptsWomen', 'Women'),
    new SearchFilter('acceptsCouples', 'Couples'),
    new SearchFilter('acceptsSingleSexCouples', 'Same-Sex Couples'),
    new SearchFilter('acceptsFamilies', 'Families'),
    new SearchFilter('acceptsYoungPeople', 'Young People'),
    new SearchFilter('acceptsBenefitsClaimants', 'Benefits Claimants')
  ])

  self.resetFilter = function () {
    self.residentCriteriaFilters()
      .forEach((f) => {
        f.value(undefined)
      })
  }

  self.updateResults = function (e) {
    locationSelector
      .getPreviouslySetPostcode()
      .then((result) => {
        self.init(result)
      })
  }

  const getFilterQuerystring = function () {
    return self.residentCriteriaFilters()
      .filter((f) => f.value() !== undefined)
      .map((f) => `&${f.dataFieldName()}=${f.value()}`)
      .join('')
  }

  self.updateListing = function () {
    self.dataIsLoaded(false)
    getCoords(self.locationName(), (postcodeResult) => {
      const newLocation = {
        latitude: postcodeResult.latitude,
        longitude: postcodeResult.longitude,
        postcode: postcodeResult.postcode
      }
      storage.set(storage.keys.userLocationState, newLocation)
      self.init(newLocation)
    }, () => {
      self.items([])
      self.dataIsLoaded(true)
      browser.loaded()
    })
  }

  self.init = (currentLocation) => {
    browser.loading()
    const endpoint = `${endpoints.accommodation}?latitude=${currentLocation.latitude}&longitude=${currentLocation.longitude}${getFilterQuerystring()}`
    ajaxGet.data(endpoint)
      .then((result) => {
        result.data.items
          .forEach((e, i) => {
            e.mapIndex = i
          })
        self.locationName(currentLocation.postcode)
        self.items(result.data.items.map((i) => new Accommodation(i, [self])))

        const types = Array.from(new Set(result.data.items
          .map((i) => i.accommodationType)))
          .filter((i) => i !== null && i.length > 0)
          .map((i) => new TypeFilter(i, [self]))
        const all = new TypeFilter('all', [self], true)
        self.typeFilters([all, ...types])

        self.dataIsLoaded(true)
        browser.loaded()

        const filterInQs = querystring.parameter('filterId')
        if (filterInQs !== undefined && filterInQs.length) {
          self.selectedTypeFilterName(filterInQs)
        }
      })
  }

  locationSelector
    .getPreviouslySetPostcode()
    .then((result) => {
      storage.set(storage.keys.userLocationState, {
        'postcode': result.postcode,
        'longitude': result.longitude,
        'latitude': result.latitude
      })
      self.init(result)
    })
}

module.exports = AccommodationListing
