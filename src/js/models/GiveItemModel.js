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

  ko.validation.init({
    insertMessages: true,
    decorateInputElement: true,
    parseInputAttributes: true,
    errorMessageClass: 'form__error',
    errorElementClass: 'form__input--error'
  }, true)

  self.needDescription = ko.observable()

  self.validationErrors = ko.validation.group(self.formModel)

  var needId = getUrlParams.parameter('needId')
  var providerId = getUrlParams.parameter('providerId')
  var endpoint = endpoints.allServiceProviders + providerId + '/needs/' + needId
  var postEndpoint = endpoints.needs + needId + '/offers-to-help'

  browser.loading()

  getApiData.data(endpoint)
    .then(function (success) {
      browser.loaded()
      self.needDescription(success.data.description)
    }, function (error) {
      browser.redirect('404.html')
    })

  self.submit = function () {
    if(self.formModel.isValid()) {
      postApiData.post(postEndpoint,
      {
        'Email': self.formModel().email(),
        'Message': self.formModel().message(),
        'IsOptedIn': self.formModel().isOptedIn()
      })
    } else {
      self.validationErrors.showAllMessages()
    }
  }
}

module.exports = GiveItemModel
