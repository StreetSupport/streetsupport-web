const Q = require('q')
const getLocation = require('./get-location')
const geolib = require('geolib')
const querystring = require('./get-url-parameter')
let SupportedCities = require('./supportedCities')
let supportedCities = new SupportedCities()

let _nearestSupported = () => {
  let deferred = Q.defer()

  if (getLocation.isAvailable()) {
    getLocation.location()
      .then((position) => {
        let getNearest = (position) => {
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
          return sorted[0]
        }
        deferred.resolve(getNearest(position))
      }, (_) => {
        deferred.resolve(supportedCities.default)
      })
  } else {
    deferred.resolve(supportedCities.default)
  }

  return deferred.promise
}

let _useMyLocation = (deferred) => {
  getLocation.location()
    .then((result) => {
      deferred.resolve({
        id: 'my-location',
        isSelected: true,
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
        name: 'my location'
      })
    }, (_) => {
      _useNearest(deferred)
    })
}

let _useNearest = (deferred) => {
  _nearestSupported()
    .then((result) => {
      deferred.resolve(result)
    }, (_) => {
      deferred.resolve(supportedCities.default)
    })
}

let _useRequested = (deferred, locationInQueryString) => {
  let requestedCity = supportedCities.get(locationInQueryString)
  if (requestedCity !== undefined) {
    deferred.resolve(requestedCity)
  } else {
    _useNearest(deferred)
  }
}

let _useSaved = (deferred) => {
  var saved = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*\=\s*([^;]*).*$)|^.*$/, '$1')
  if (saved !== undefined && saved.length > 0 && saved !== 'my-location') {
    deferred.resolve(supportedCities.get(saved))
  } else {
    _useNearest(deferred)
  }
}

let _determineLocationRetrievalMethod = (deferred, locationInQueryString) => {
  if (locationInQueryString === 'my-location' && getLocation.isAvailable()) {
    return _useMyLocation
  }
  if (locationInQueryString !== 'undefined' && locationInQueryString.length > 0 && locationInQueryString !== 'my-location') {
    return _useRequested
  }
  return _useSaved
}

let _getCurrent = () => {
  let deferred = Q.defer()
  let locationInQueryString = querystring.parameter('location')
  let getLocation = _determineLocationRetrievalMethod(deferred, locationInQueryString)
  getLocation(deferred, locationInQueryString)
  return deferred.promise
}

let _setCurrent = (newCity) => {
  if (newCity.length > 0) {
    var now = new Date()
    var expireTime = now.getTime() + 1000 * 36000
    now.setTime(expireTime)
    document.cookie = 'desired-location=' + newCity + ';expires=' + +now.toUTCString() + ';path=/'
  }
}

let locationSelector = function () {
  var self = this
  self.getCurrent = _getCurrent
  self.getViewModel = (current) => {
    let cities = supportedCities.locations.map((l) => {
      let newLocation = l
      newLocation.isSelected = l.id === current.id
      return newLocation
    })
    return cities
  }
  self.getViewModelAll = (current) => {
    let cities = supportedCities.locations.map((l) => {
      let newLocation = l
      newLocation.isSelected = l.id === current.id
      return newLocation
    })
    cities.push({
      id: '',
      isSelected: querystring.parameter('location') === '',
      name: 'All'
    })
    return cities
  }
  self.handler = (onChangeLocationCallback, selectorId) => {
    if (selectorId === undefined) {
      selectorId = '.js-location-select'
    }
    let locationSelector = document.querySelector(selectorId)
    locationSelector.addEventListener('change', () => {
      var selectedLocation = locationSelector.options[locationSelector.selectedIndex].value
      _setCurrent(selectedLocation)
      onChangeLocationCallback(selectedLocation)
    })
  }
}

module.exports = locationSelector
