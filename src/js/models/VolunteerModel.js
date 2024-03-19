/* global location, history */
import { categories as volCategories } from '../../data/generated/volunteer-categories'

const ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!

const apiRoutes = require('../api')
const postApi = require('../post-api-data')
const browser = require('../browser')
const supportedCities = require('../location/supportedCities')
const formId = 'js-form'
const failId = 'js-fail'
const successId = 'js-success'
const theForm = document.getElementById(formId)
const theFail = document.getElementById(failId)
const theSuccess = document.getElementById(successId)
const hideClass = 'hide'

const VolunteerModel = function (currCityId) {
  const self = this

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
  self.city = ko.observable(currCityId)
  self.cities = supportedCities.locations
  self.postcode = ko.observable('').extend({ required: true })
  self.skillsAndExperience = ko.observable('')
  self.skillsCategories = ko.observableArray(volCategories)
  self.skillCategory = ko.observableArray([])
  self.availability = ko.observable('')
  self.resources = ko.observable('')
  self.isOptedIn = ko.observable(false)

  if (browser.location().pathname.includes('greater-manchester/volunteer')) {
    self.skillCategory(['gm-winter-volunteer'])
  }

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
        SkillsCategories: self.skillCategory(),
        SkillsAndExperienceDescription: self.skillsAndExperience(),
        AvailabilityDescription: self.availability(),
        ResourcesDescription: self.resources(),
        IsOptedIn: self.isOptedIn()
      }

      // TODO: Nice notification on success/fail
      postApi.post(apiRoutes.createVolunteerEnquiry, payload).then(function (result) {
        browser.loaded()
        if (result.statusCode.toString().charAt(0) !== '2') {
          theForm.classList.add(hideClass)
          theFail.classList.remove(hideClass)
        } else {
          theForm.classList.add(hideClass)
          theSuccess.classList.remove(hideClass)
        }
      })
    } else {
      self.errors.showAllMessages()

      // Jump to top of form
      var url = location.href
      location.href = '#' + formId
      history.replaceState(null, null, url)
    }
  }

  self.errors = ko.validation.group(self)
}

module.exports = VolunteerModel
