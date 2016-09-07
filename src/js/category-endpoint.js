var getLocation = require('./get-location')
var SupportedCities = require('./supportedCities')
var find = require('lodash/collection/find')
var Q = require('q')
var supportedCities = new SupportedCities()

var getEndpointUrl = function (categoryUrl, theLocation) {
  let getUrl = (categoryUrl, latitude, longitude) => {
    let isTimetabled = (categoryUrl) => {
      return categoryUrl.indexOf('timetabled-service-providers') >= 0
    }
    if (isTimetabled(categoryUrl)) return categoryUrl + '/long/' + longitude + '/lat/' + latitude
    return categoryUrl + '/' + latitude + '/' + longitude
  }

  var self = this
  self.deferred = Q.defer()

  if (theLocation.length) {
    var requestedLocation = find(supportedCities.locations, function (loc) {
      return loc.id === theLocation
    })

    if (requestedLocation !== false) {
      document.cookie = 'desired-location=' + theLocation

      var latitude = requestedLocation.latitude
      var longitude = requestedLocation.longitude
      var locationUrl = getUrl(categoryUrl, latitude, longitude)
      self.deferred.resolve(locationUrl)
    }
  }

  if (navigator.geolocation) {
    getLocation.location().then(function (position) {
      var latitude = position.coords.latitude
      var longitude = position.coords.longitude
      var locationUrl = getUrl(categoryUrl, latitude, longitude)
      self.deferred.resolve(locationUrl)
    }).fail(function () {
      self.deferred.resolve(categoryUrl)
    })
  }

  return self.deferred.promise
}

module.exports = {
  getEndpointUrl: getEndpointUrl
}
