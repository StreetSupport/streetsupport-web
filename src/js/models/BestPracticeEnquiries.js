const ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!

const api = require('../post-api-data')
const browser = require('../browser')
const endpoints = require('../api')

function BestPracticeApply () {
  const self = this

  self.name = ko.observable().extend({ required: true })
  self.orgName = ko.observable().extend({ required: true })
  self.telephone = ko.observable()
  self.email = ko.observable().extend({
    email: true,
    required: {
      message: 'Please enter an email address or telephone number',
      onlyIf: function () {
        return self.telephone() !== undefined && self.telephone().length === 0
      }
    }
  })
  self.message = ko.observable().extend({ required: true })

  ko.validation.init({
    insertMessages: true,
    decorateInputElement: true,
    parseInputAttributes: true,
    errorMessageClass: 'form__error',
    errorElementClass: 'form__input--error'
  }, true)
  self.errors = ko.validation.group(self)

  self.isFormSubmitSuccessful = ko.observable(false)
  self.isFormSubmitFailure = ko.observable(false)

  self.apiErrors = ko.observableArray()

  self.postFormData = () => {
    browser.loading()

    const endpoint = endpoints.bestPracticeEnquiries
    const data = {
      Name: self.name(),
      OrganisationName: self.orgName(),
      Email: self.email(),
      Telephone: self.telephone(),
      Message: self.message()
    }

    api
      .post(endpoint, data)
      .then((result) => {
        browser.loaded()
        if (result.statusCode === 201) {
          self.isFormSubmitFailure(false)
          self.isFormSubmitSuccessful(true)
        } else {
          self.apiErrors = ko.observableArray(result.data.messages)
          self.isFormSubmitFailure(true)
        }
      }, () => {
        browser.redirect('/500')
      })
  }

  self.submit = () => {
    if (self.errors().length === 0) {
      self.postFormData()
    } else {
      self.errors.showAllMessages()
    }
  }
}

module.exports = BestPracticeApply
