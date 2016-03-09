var ko = require('knockout')
var getUrlParams = require('../get-url-parameter')
var getApiData = require('../get-api-data')
var endpoints = require('../api')
var browser = require('../browser')

var GiveItemModel = function () {
  var self = this

  var needId = getUrlParams.parameter('needId')
  var endpoint = endpoints.needs + needId

  getApiData.data(endpoint)
    .then(function (success) {

    }, function (error) {
      browser.redirect('404.html')
    })
}

module.exports = GiveItemModel
