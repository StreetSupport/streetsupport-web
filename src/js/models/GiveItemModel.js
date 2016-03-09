var ko = require('knockout')
var getUrlParams = require('../get-url-parameter')
var getApiData = require('../get-api-data')
var postApiData = require('../post-api-data')
var endpoints = require('../api')
var browser = require('../browser')

var GiveItemModel = function () {
  var self = this

  self.email = ko.observable()
  self.message = ko.observable()
  self.needDescription = ko.observable('wangers')
  self.isOptedIn = ko.observable(false)

  var needId = getUrlParams.parameter('needId')
  var providerId = getUrlParams.parameter('providerId')
  var endpoint = endpoints.allServiceProviders + providerId + '/needs/' + needId
  var postEndpoint = endpoints.needs + needId + '/offers-to-help'

  getApiData.data(endpoint)
    .then(function (success) {
      self.needDescription(success.data.description)
    }, function (error) {
      browser.redirect('404.html')
    })

  self.submit = function () {
    postApiData.post(postEndpoint,
    {
      'Email': self.email(),
      'Message': self.message(),
      'IsOptedIn': self.isOptedIn()
    })
  }
}

module.exports = GiveItemModel
