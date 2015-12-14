var Q = require('q')

var getLocation = function () {
  var deferred = Q.defer()
  var options = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  }

  function success (position) {
    deferred.resolve(position)
  }

  function error (error) {
    deferred.reject(error)
  }

  navigator.geolocation.getCurrentPosition(success, error, options)

  return deferred.promise
}

module.exports = {
  location: getLocation
}
