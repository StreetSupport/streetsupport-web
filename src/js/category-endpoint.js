var getLocation = require('./get-location')
var find = require('lodash/collection/find')
var Q = require('q')

var getEndpointUrl = function (categoryUrl, theLocation) {

  let getUrl = (categoryUrl, latitude ,longitude) => {
      return categoryUrl += '/' + latitude + '/' + longitude
  }

  var self = this
  self.deferred = Q.defer()

  if (theLocation.length) {
    var locations = [
      {
        'key': 'manchester',
        'name': 'Manchester',
        'longitude': -2.24455696347558,
        'latitude': 53.4792777155671
      },
      {
        'key': 'leeds',
        'name': 'Leeds',
        'longitude': -1.54511238485298,
        'latitude': 53.7954906003838
      }
    ]
    var requestedLocation = find(locations, function (loc) {
      return loc.key === theLocation
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
