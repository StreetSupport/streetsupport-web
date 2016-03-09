var ko = require('knockout')
var getUrlParams = require('../get-url-parameter')
var getApiData = require('../get-api-data')
var endpoints = require('../api')

var GiveItemModel = function () {
  var self = this

  var needId = getUrlParams.parameter('needId')
  var endpoint = endpoints.needs + needId
  console.log(endpoint)

  getApiData.data(endpoint)
}

module.exports = GiveItemModel

