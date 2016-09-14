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

let _getCurrent = () => {
  let deferred = Q.defer()
  let locationInQueryString = querystring.parameter('location')
  if (locationInQueryString === 'my-location' && getLocation.isAvailable()) {
    console.log('_getCurrent - my-location and location available')
    getLocation.location()
      .then((result) => {
        console.log(result)
        deferred.resolve({
          id: 'my-location',
          isSelected: true,
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          name: 'my location'
        })
      }, (_) => {})
  } else if (locationInQueryString !== 'undefined' && locationInQueryString.length > 0 && locationInQueryString !== 'my-location') {
    let requestedCity = supportedCities.get(locationInQueryString)
    if (requestedCity !== undefined) {
      console.log('_getCurrent - valid location in qs')
      deferred.resolve(requestedCity)
    } else {
      console.log('_getCurrent - invalid location in qs; get nearest supported')
      _nearestSupported()
        .then((result) => {
          deferred.resolve(result)
        }, (_) => {
        })
    }
  } else {
    var saved = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*\=\s*([^;]*).*$)|^.*$/, '$1')
    if (saved !== undefined && saved.length > 0 && saved !== 'my-location') {
      deferred.resolve(supportedCities.get(saved))
    } else {
      _nearestSupported()
        .then((result) => {
          deferred.resolve(result)
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
  self.getViewModel = (current) => {
    let cities = supportedCities.locations.map((l) => {
      let newLocation = l
      newLocation.isSelected = l.id === current.id
      return newLocation
    })
    if (getLocation.isAvailable()) {
      cities.push({
        id: 'my-location',
        isSelected: querystring.parameter('location') === 'my-location',
        name: 'my location'
      })
    }
    return cities
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
