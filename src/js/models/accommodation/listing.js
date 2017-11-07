const ajaxGet = require('../../get-api-data')
const endpoints = require('../../api')
const browser = require('../../browser')
const querystring = require('../../get-url-parameter')
const locationSelector = require('../../location/locationSelector')

import {Accommodation, TypeFilter} from './types'
import {getCoords} from '../../location/postcodes'
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
  self.dataIsLoaded = ko.observable(false)
  self.items = ko.observableArray()
  self.selectedTypeFilterName = ko.observable()
  self.noItemsAvailable = ko.computed(() => self.items().length === 0, self)
  self.typeFilters = ko.observableArray()
  self.typeFiltered = ko.observable(false)
  self.locationName = ko.observable()
  self.loadNext = function () {
    self.loadItems(endpoints.getFullUrl(self.nextPageEndpoint()))
  }
  self.nextPageEndpoint = ko.observable()

  self.itemSelected = (item) => {
    self.items()
      .filter((i) => i.id !== item.id)
      .forEach((i) => i.isActive(false))
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

  self.typeFilterDropdownSelected = () => {
    const typeFilter = self.typeFilters().find((tf) => tf.typeName() === self.selectedTypeFilterName())
    typeFilter.select()
  }

  self.typeFilterSelected = (selectedFilter) => {
    self.typeFilters()
      .filter((tf) => tf.typeName() !== selectedFilter.typeName())
      .forEach((tf) => tf.deselect())
    self.selectedTypeFilterName(selectedFilter.typeName())
  }

  //TODO: Fix accommodation dropdown not clearing
  self.resetFilter = function () {
    self.residentCriteriaFilters()
      .forEach((f) => {
        f.value(undefined)
      })
    self.selectedTypeFilterName('')
  }

  const getFilterQuerystring = function () {
    let queryString = self.residentCriteriaFilters()
      .filter((f) => f.value() !== undefined)
      .map((f) => `&${f.dataFieldName()}=${f.value()}`)
      .join('')

    if (self.selectedTypeFilterName() !== undefined) {
      queryString += `&accomType=${self.selectedTypeFilterName()}`
    }

    return queryString
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

  self.loadItems = function (endpoint) {
    browser.loading()
    ajaxGet.data(endpoint)
    .then((result) => {
      result.data.items
        .forEach((e, i) => {
          e.mapIndex = i
        })
      const previous = self.items()
      const next = result.data.items.map((i) => new Accommodation(i, [self]))
      self.items([...previous, ...next])
      self.nextPageEndpoint(result.data.links.next)
      self.dataIsLoaded(true)
      browser.loaded()
    })
  }

  self.init = (currentLocation) => {
    const endpoint = `${endpoints.accommodation}?latitude=${currentLocation.latitude}&longitude=${currentLocation.longitude}${getFilterQuerystring()}`
    self.locationName(currentLocation.postcode)
    self.loadItems(endpoint)
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
