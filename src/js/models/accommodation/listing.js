const ajaxGet = require('../../get-api-data')
const endpoints = require('../../api')
const browser = require('../../browser')
const locationSelector = require('../../location/locationSelector')

const ko = require('knockout')

const Accommodation = function (data) {
  const self = this

  const mapAddress = (data) => {
    const parts = ['street1', 'street2', 'street3', 'city']
    const result = parts
      .map((p) => data[p])
      .filter((p) => p && p !== undefined && p.length > 0)
      .join(', ')
    return `${result}. ${data.postcode}`
  }

  self.id = ko.observable(data.id)
  self.name = ko.observable(data.name)
  self.address = ko.observable(mapAddress(data))
  self.additionalInfo = ko.observable(data.additionalInfo)
  self.isOpenAccess = ko.observable(data.isOpenAccess)
  self.accommodationType = ko.observable(data.accommodationType)
  self.detailsUrl = ko.observable(`details?id=${data.id}`)
}

const AccommodationListing = function () {
  const self = this

  self.items = ko.observableArray()

  self.init = (currentLocation) => {
    browser.loading()
    ajaxGet.data(`${endpoints.accommodation}?latitude=${currentLocation.latitude}&longitude=${currentLocation.longitude}`)
      .then((result) => {
        self.items(result.data.items.map(i => new Accommodation(i)))
        browser.loaded()
      })
  }

  locationSelector
    .getCurrent()
    .then((result) => {
      self.init(result)
    })
}

module.exports = AccommodationListing
