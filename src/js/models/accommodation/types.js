const ko = require('knockout')

export class Coordinates {
  constructor (data) {
    this.latitude = data.latitude
    this.longitude = data.longitude
  }

  areInitialised () {
    return this.latitude !== 0 && this.longitude !== 0
  }
}

export class Address {
  constructor (data) {
    this.street1 = data.street1
    this.street2 = data.street2
    this.street3 = data.street3
    this.city = data.city
    this.postcode = data.postcode
  }

  formattedForDisplay () {
    if (this.isEmpty()) return ''
    const addressParts = [this.street1, this.street2, this.street3, this.city]
    const result = addressParts
      .filter((p) => p && p !== undefined && p.length > 0)
      .join(', ')
    return `${result}. ${this.postcode}`
  }

  isEmpty () {
    return Object.keys(this)
      .map(propertyKey => this[propertyKey])
      .every((propertyValue) => propertyValue === '' || propertyValue === null)
  }
}

export const Accommodation = function (data, index, listeners) {
  const self = this

  const address = new Address(data)

  self.mapIndex = ko.observable(index)
  self.mapIndexToDisplay = ko.observable(index + 1)
  self.id = ko.observable(data.id)
  self.name = ko.observable(data.name)
  self.latitude = ko.observable(data.latitude)
  self.longitude = ko.observable(data.longitude)
  self.address = ko.observable(address.formattedForDisplay())
  self.additionalInfo = ko.observable(data.additionalInfo)
  self.accommodationType = ko.observable(data.accommodationType)
  self.synopsis = ko.observable(data.synopsis)
  self.referralIsRequired = ko.observable(data.referralIsRequired)
  self.detailsUrl = ko.observable(`/find-help/accommodation/listing/details?id=${data.id}`)
  self.isActive = ko.observable()

  self.selectItem = () => {
    self.isActive(true)
    listeners
      .forEach((l) => l.itemSelected(self))
  }
}

export const TypeFilter = function (name, listeners, isSelected = false) {
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

export const AccommodationDetails = function (data) {
  this.name = ko.observable(data.generalInfo.name)
}
