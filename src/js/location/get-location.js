import * as Q from 'q'

/**
 * returns promise containing browser geo-location
 */
const getLocation = function () {
  const deferred = Q.defer()
  const options = {
    maximumAge: 5 * 60 * 1000,
    timeout: 3000
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

/**
 * returns if browser supports geolocation
 */
const isAvailable = function () {
  return ('geolocation' in navigator)
}

module.exports = {
  location: getLocation,
  isAvailable: isAvailable
}
