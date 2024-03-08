import { categories } from '../../../../data/generated/need-categories'

var ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!

var apiRoutes = require('../../../api')
var postApi = require('../../../post-api-data')
var browser = require('../../../browser')
var supportedCities = require('../../../location/supportedCities')

var OfferItemModel = function (currCityId) {
  var self = this

  self.isSubmitted = ko.observable(false)
  self.isSuccess = ko.observable(false)

  ko.validation.init({
    insertMessages: true,
    decorateInputElement: true,
    parseInputAttributes: true,
    errorMessageClass: 'form__error',
    errorElementClass: 'form__input--error'
  }, true)

  self.firstName = ko.observable('').extend({ required: true })
  self.lastName = ko.observable('').extend({ required: true })
  self.email = ko.observable('').extend({ required: true })
  self.telephone = ko.observable('')
  self.city = ko.observable(currCityId).extend({ required: true })
  self.isManchester = ko.computed(function () {
    return self.city() === 'manchester'
  }, self)
  self.cities = supportedCities.locations
  self.cities.push({
    id: '',
    name: 'Other'
  })
  self.postcode = ko.observable('').extend({ required: true })
  self.description = ko.observable('').extend({ required: true })
  self.additionalInfo = ko.observable('')

  self.categories = ko.observableArray()
  self.selectedCategories = ko.computed(function () {
    return self.categories()
      .filter((c) => c.isChecked())
      .map((c) => c.key)
  }, self)

  self.otherCategory = ko.observable('').extend({
    required: {
      message: 'Select a category or describe here.',
      onlyIf: function () {
        return self.selectedCategories().length === 0
      }
    }
  })
  self.otherCategoryChecked = ko.computed(function () {
    return self.otherCategory().length > 0
  }, self)
  self.isOptedIn = ko.observable(false)

  self.submitForm = function () {
    if (self.errors().length === 0) {
      browser.loading()
      var payload = {
        FirstName: self.firstName(),
        LastName: self.lastName(),
        Email: self.email(),
        Telephone: self.telephone(),
        City: self.city(),
        Postcode: self.postcode(),
        Description: self.description(),
        AdditionalInfo: self.additionalInfo(),
        SelectedCategories: self.selectedCategories(),
        IsOptedIn: self.isOptedIn(),
        OtherCategory: self.otherCategory()
      }

      postApi.post(apiRoutes.createOfferOfItems, payload)
        .then(function (result) {
          self.isSubmitted(true)
          browser.loaded()
          if (result.statusCode.toString().charAt(0) !== '2') {
            self.isSuccess(false)
            browser.scrollTo('.requests-detail__heading--i-want-to-volunteer')
          } else {
            self.isSuccess(true)
            browser.scrollTo('.requests-detail__heading--i-want-to-volunteer')
          }
        }, () => {
          browser.redirect('/500/')
        })
    } else {
      self.errors.showAllMessages()

      browser.scrollTo('#js-form')
    }
  }

  self.errors = ko.validation.group(self)

  self.init = () => {
    categories.forEach((c) => {
      c.isChecked = ko.observable(false)
    })
    self.categories(categories)
  }

  self.init()
}

module.exports = OfferItemModel
