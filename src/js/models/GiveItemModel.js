var ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!
var getUrlParams = require('../get-url-parameter')
var getApiData = require('../get-api-data')
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

  self.needDescription = ko.observable()
  self.providerName = ko.observable()
  self.needReason = ko.observable()

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

  var needId = getUrlParams.parameter('id')
  var endpoint = endpoints.needs + needId
  var postEndpoint = endpoints.needs + needId + '/offers-to-help'

  browser.loading()

  getApiData.data(endpoint)
    .then(function (success) {
      browser.loaded()
      self.providerName(success.data.serviceProviderName)
      self.needReason(success.data.reason)
      self.needDescription(success.data.description)
    }, function (error) {
      browser.redirect('/404/')
    })

  self.submit = function () {
    if(self.formModel.isValid()) {
      browser.loading()
      postApiData.post(postEndpoint,
      {
        'Email': self.formModel().email(),
        'Message': self.formModel().message(),
        'IsOptedIn': self.formModel().isOptedIn()
      }).then(function (success) {
        browser.loaded()
        if(success.status === 'error') {
          self.isFormSubmitFailure(true)
          self.apiErrors(success.messages)
        }else {
          self.isFormSubmitSuccessful(true)
          self.isFormSubmitFailure(false)
          browser.trackEvent('give-item-submit-details', 'submit-form', 'success')
        }
      }, function (error) {
        browser.redirect('/500/')
      })
    } else {
      self.fieldErrors.showAllMessages()
    }
  }
}

module.exports = GiveItemModel
