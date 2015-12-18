var getLocation = require('./get-location')
var find = require('lodash/collection/find')

var getEndpointUrl = function (categoryUrl, theLocation) {
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
      var latitude = requestedLocation.latitude
      var longitude = requestedLocation.longitude
      var locationUrl = categoryUrl += '/long/' + longitude + '/lat/' + latitude

      return locationUrl
    }
  }

  if (navigator.geolocation) {
    getLocation.location().then(function (position) {
      var latitude = position.coords.latitude
      var longitude = position.coords.longitude
      var locationUrl = categoryUrl += '/long/' + longitude + '/lat/' + latitude

      return locationUrl
    }).fail(function (error) {
      console.error('GEOLOCATION ERROR: ' + error)
      return categoryUrl
    })
  }

  return categoryUrl
}

module.exports = {
  getEndpointUrl: getEndpointUrl
}
