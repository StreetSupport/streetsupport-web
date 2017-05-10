const ko = require('knockout')

export const Accommodation = function (data, listeners) {
  const self = this

  console.log(data)

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
