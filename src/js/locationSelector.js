let SupportedCities = require('./supportedCities')
const Q = require('q')
const getLocation = require('./get-location')
const geolib = require('geolib')
const querystring = require('./get-url-parameter')
let supportedCities = new SupportedCities()

let _nearest = () => {
  let deferred = Q.defer()

  if (navigator.geolocation) {
    console.log('ls: getting user location')
    getLocation.location()
    .then((position) => {
      let currLatitude = position.coords.latitude
      let currLongitude = position.coords.longitude

      for (let i = 0; i < supportedCities.locations.length; i++) {
        let distanceInMetres = geolib.getDistance(
          { latitude: currLatitude, longitude: currLongitude },
          { latitude: supportedCities.locations[i].latitude, longitude: supportedCities.locations[i].longitude }
        )
        supportedCities.locations[i].distance = distanceInMetres
      }

      let sorted = supportedCities.locations
        .sort((a, b) => {
          if (a.distance < b.distance) return -1
          if (a.distance > b.distance) return 1
          return 0
        })
      deferred.resolve(sorted[0])
    }, (_) => {
      deferred.resolve(supportedCities.default)
    })
  } else {
    deferred.resolve(supportedCities.default)
  }

  return deferred.promise
}

let _getCurrent = () => {
  let deferred = Q.defer()

  let locationInQueryString = querystring.parameter('location')
  if (locationInQueryString.length > 0) {
    deferred.resolve(locationInQueryString)
  } else {
    var saved = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*\=\s*([^;]*).*$)|^.*$/, '$1')
    if (saved !== undefined && saved.length > 0) {
      deferred.resolve(saved)
    } else {
      _nearest()
        .then((result) => {
          deferred.resolve(result.id)
        }, (_) => {
        })
    }
  }
  return deferred.promise
}

let _setCurrent = (newCity) => {
  document.cookie = 'desired-location=' + newCity
}

let locationSelector = function () {
  var self = this
  self.getCurrent = _getCurrent
  self.getViewModel = () => {
    let deferred = Q.defer()

    _getCurrent()
      .then((current) => {
        let cities = supportedCities.locations.map((l) => {
          let newLocation = l
          newLocation.isSelected = l.id === current
          return newLocation
        })
        deferred.resolve(cities)
      }, (_) => {
      })

    return deferred.promise
  }
  self.handler = (onChangeLocationCallback) => {
    let locationSelector = document.querySelector('.js-location-select')
    locationSelector.addEventListener('change', () => {
      var selectedLocation = locationSelector.options[locationSelector.selectedIndex].value
      _setCurrent(selectedLocation)
      onChangeLocationCallback(selectedLocation)
    })
  }
}

module.exports = locationSelector
