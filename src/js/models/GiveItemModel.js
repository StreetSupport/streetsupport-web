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
  self.isOptedIn = ko.observable(false)

  var needId = getUrlParams.parameter('needId')
  var endpoint = endpoints.needs + needId

  getApiData.data(endpoint)
    .then(function (success) {
    }, function (error) {
      browser.redirect('404.html')
    })

  self.submit = function () {
    postApiData.post(endpoint + '/offers-to-help',
    {
      'Email': self.email(),
      'Message': self.message(),
      'IsOptedIn': self.isOptedIn()
    })
  }
}

module.exports = GiveItemModel
