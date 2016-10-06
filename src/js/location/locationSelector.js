const Q = require('q')
const getLocation = require('../get-location')
const geolib = require('geolib')
const querystring = require('../get-url-parameter')
let supportedCities = require('./supportedCities')

let _nearestSupported = () => {
  let deferred = Q.defer()

  let getDefault = () => {
    let modal = document.querySelector('.js-location-select-modal')
    modal.classList.add('is-active')

    let modalCloser = document.querySelector('.js-modal-close')
    modalCloser.addEventListener('click', (e) => {
      modal.classList.remove('is-active')
      setCurrent(supportedCities.default().id)
      window.location.reload()
    })

    document.querySelector('.js-location-select-manchester')
      .addEventListener('click', (e) => {
        e.preventDefault()
        setCurrent('manchester')
        window.location.reload()
      })
    document.querySelector('.js-location-select-leeds')
      .addEventListener('click', (e) => {
        e.preventDefault()
        setCurrent('leeds')
        window.location.reload()
      })
  }

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
            .filter((l) => l.distance <= 10000)
            .sort((a, b) => {
              if (a.distance < b.distance) return -1
              if (a.distance > b.distance) return 1
              return 0
            })

          if (sorted.length === 0) return getDefault()

          return sorted[0]
        }
        deferred.resolve(getNearest(position))
      }, (_) => {
        deferred.resolve(getDefault())
      })
  } else {
    deferred.resolve(getDefault())
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
      deferred.resolve(supportedCities.default())
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

let getCurrent = () => {
  let deferred = Q.defer()
  let locationInQueryString = querystring.parameter('location')
  let getLocation = _determineLocationRetrievalMethod(deferred, locationInQueryString)
  getLocation(deferred, locationInQueryString)
  return deferred.promise
}

let setCurrent = (newCity) => {
  if (newCity.length > 0) {
    var now = new Date()
    var expireTime = now.getTime() + 1000 * 36000
    now.setTime(expireTime)
    document.cookie = 'desired-location=' + newCity + ';expires=' + +now.toUTCString() + ';path=/'
  }
}

const getViewModel = (current) => {
  let cities = supportedCities.locations.map((l) => {
    let newLocation = l
    newLocation.isSelected = l.id === current.id
    return newLocation
  })
  return cities
}

const getViewModelAll = (current) => {
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

const onChange = (onChangeLocationCallback, selectorId) => {
  if (selectorId === undefined) {
    selectorId = '.js-location-select'
  }
  let locationSelector = document.querySelector(selectorId)
  locationSelector.addEventListener('change', () => {
    var selectedLocation = locationSelector.options[locationSelector.selectedIndex].value
    setCurrent(selectedLocation)
    onChangeLocationCallback(selectedLocation)
  })
}

module.exports = {
  getCurrent: getCurrent,
  setCurrent: setCurrent,
  getViewModel: getViewModel,
  getViewModelAll: getViewModelAll,
  handler: onChange
}
