var SupportedCities = require('./supportedCities')
var find = require('lodash/collection/find')
var supportedCities = new SupportedCities()

var getEndpointUrl = function (categoryUrl, theLocation) {
  let getUrl = (categoryUrl, latitude, longitude) => {
    let isTimetabled = (categoryUrl) => {
      return categoryUrl.indexOf('timetabled-service-providers') >= 0
    }
    if (isTimetabled(categoryUrl)) return categoryUrl + '/long/' + longitude + '/lat/' + latitude
    return categoryUrl + '/' + latitude + '/' + longitude
  }

  var requestedLocation = find(supportedCities.locations, function (loc) {
    return loc.id === theLocation
  })

  document.cookie = 'desired-location=' + theLocation

  var latitude = requestedLocation.latitude
  var longitude = requestedLocation.longitude
  var locationUrl = getUrl(categoryUrl, latitude, longitude)
  return locationUrl
}

module.exports = {
  getEndpointUrl: getEndpointUrl
}
