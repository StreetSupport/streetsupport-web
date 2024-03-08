var ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!
var postApiData = require('../post-api-data')
var endpoints = require('../api')
var browser = require('../browser')

var Model = function () {
  var self = this

  self.formModel = ko.validatedObservable({
    name: ko.observable().extend({ required: true }),
    email: ko.observable().extend({ required: true, email: true }),
    reason: ko.observable(),
    location: ko.observable().extend({ required: true }),
    isOptedIn: ko.observable(false)
  })

  self.needDescription = ko.observable()

  ko.validation.init({
    insertMessages: true,
    decorateInputElement: true,
    parseInputAttributes: true,
    errorMessageClass: 'form__error',
    errorElementClass: 'form__input--error'
  }, true)
  self.isFormSubmitSuccessful = ko.observable(false)
  self.isFormSubmitFailure = ko.observable(false)
  self.fieldErrors = ko.validation.group(self.formModel)
  self.apiErrors = ko.observableArray()

  self.submit = function () {
    if (self.formModel.isValid()) {
      browser.loading()
      postApiData
        .post(endpoints.joinStreetSupportApplications, {
          Name: self.formModel().name(),
          Email: self.formModel().email(),
          Reason: self.formModel().reason(),
          Location: self.formModel().location(),
          IsOptedIn: self.formModel().isOptedIn()
        }).then(function (success) {
          browser.loaded()
          if (success.status === 'error') {
            self.isFormSubmitFailure(true)
            self.apiErrors(success.messages)
          } else {
            self.isFormSubmitSuccessful(true)
            self.isFormSubmitFailure(false)
            browser.trackEvent('join-street-support', 'submit-form', 'success')
          }
        }, function () {
          browser.redirect('/500/')
        })
    } else {
      self.fieldErrors.showAllMessages()
    }
  }
}

module.exports = Model
