var ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!
var postApiData = require('../post-api-data')
var endpoints = require('../api')
var browser = require('../browser')

var GiveItemModel = function () {
  var self = this

  self.formModel = ko.validatedObservable({
    email: ko.observable().extend({ required: true, email: true }),
    message: ko.observable().extend({ required: true }),
    isOptedIn: ko.observable(false)
  })

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

      var postEndpoint = endpoints.needs + self.needId + '/offers-to-help'
      const payload = {
        Email: self.formModel().email(),
        Message: self.formModel().message(),
        IsOptedIn: self.formModel().isOptedIn()
      }

      postApiData
        .post(postEndpoint, payload)
        .then(function (success) {
          browser.loaded()
          if (success.status === 'error') {
            self.isFormSubmitFailure(true)
            self.apiErrors(success.messages)
          } else {
            self.isFormSubmitSuccessful(true)
            self.isFormSubmitFailure(false)
            browser.trackEvent('give-item-submit-details', 'submit-form', 'success')
          }
        }, function () {
          browser.redirect('/500/')
        })
    } else {
      self.fieldErrors.showAllMessages()
    }
  }
}

module.exports = GiveItemModel
