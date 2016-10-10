var Q = require('q')
var supportedCities = require('./supportedCities')

var getLocation = function () {
  var deferred = Q.defer()
  var options = {
    maximumAge: 5 * 60 * 1000,
    timeout: 3000
  }

  let result = false

  function success (position) {
    result = position
    deferred.resolve(position)
  }

  function error (error) {
    deferred.reject(error)
  }

  navigator.geolocation.getCurrentPosition(success, error, options)

  setTimeout(() => {
    if (!result) {
      let defaultCity = supportedCities.default()
      deferred.resolve({
        coords: {
          latitude: defaultCity.latitude,
          longitude: defaultCity.longitude
        }
      })
    }
  }, options.timeout + 1000)

  return deferred.promise
}

let isAvailable = () => {
  if (navigator.geolocation) return true
  return false
}

module.exports = {
  location: getLocation,
  isAvailable: isAvailable
}
