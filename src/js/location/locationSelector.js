const Q = require('q')
const deviceGeo = require('./get-location')
const querystring = require('../get-url-parameter')
let supportedCities = require('./supportedCities')
const browser = require('../browser')
const cookies = require('../cookies')
let modal = require('./modal')

let _userSelect = (deferred) => {
  modal.init(exportedObj)
  deferred.resolve()
}

let _useMyLocation = (deferred) => {
  deviceGeo.location()
    .then((result) => {
      let cityId = 'my-location'
      var saved = cookies.get('desired-location')
      if (saved !== undefined && saved.length > 0) {
        cityId = supportedCities.get(saved).id
      }

      deferred.resolve({
        id: cityId,
        findHelpId: 'my-location',
        isSelected: true,
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
        name: 'my location'
      })
    }, (error) => {
      console.log(error)
      let cityId = 'my-location'
      var saved = cookies.get('desired-location')
      if (saved !== undefined && saved.length > 0) {
        cityId = supportedCities.get(saved).id
      }
      deferred.resolve({
        id: cityId,
        findHelpId: 'my-location',
        isSelected: true,
        latitude: 0,
        longitude: 0,
        name: 'my location',
        geoLocationUnavailable: true
      })
    })
}

let _useRequested = (deferred, locationInQueryString) => {
  let requestedCity = supportedCities.get(locationInQueryString)
  if (requestedCity !== undefined) {
    deferred.resolve(requestedCity)
  } else {
    _userSelect(deferred)
  }
}

let _useSaved = (deferred) => {
  var saved = cookies.get('desired-location')
  if (saved === 'elsewhere' && deviceGeo.isAvailable()) {
    _useMyLocation(deferred)
  } else if (saved !== undefined && saved.length > 0 && saved !== 'my-location') {
    deferred.resolve(supportedCities.get(saved))
  } else {
    _userSelect(deferred)
  }
}

let _determineLocationRetrievalMethod = () => {
  let method = _useSaved
  let id = ''

  let locationInQueryString = querystring.parameter('location')
  if (locationInQueryString === 'my-location' && deviceGeo.isAvailable()) {
    method = _useMyLocation
  } else if (locationInQueryString !== 'undefined' && locationInQueryString.length > 0 && locationInQueryString !== 'my-location') {
    method = _useRequested
    id = locationInQueryString
  } else {
    const locationInPath = browser.location().pathname.split('/')[1]
    const cities = supportedCities.locations.map((l) => l.id)
    if (locationInPath !== 'undefined' && locationInPath.length > 0 && cities.indexOf(locationInPath) > -1) {
      method = _useRequested
      id = locationInPath

      setCurrent(id)
    }
  }

  return {
    method: method,
    id: id
  }
}

const getCurrent = () => {
  let deferred = Q.defer()
  let getLocation = _determineLocationRetrievalMethod()
  getLocation.method(deferred, getLocation.id)
  return deferred.promise
}

const setCurrent = (newCity) => {
  if (newCity.length > 0) {
    document.cookie = 'desired-location=' + newCity + ';expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/'
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

/**
 * inject a callback when location selector changes
 * @param {function} onChangeLocationCallback
 * @param {string} selectorId
 */
const onChange = (onChangeLocationCallback, selectorId = '.js-location-select') => {
  let locationSelector = document.querySelector(selectorId)
  locationSelector.addEventListener('change', () => {
    var selectedLocation = locationSelector.options[locationSelector.selectedIndex].value
    setCurrent(selectedLocation)
    onChangeLocationCallback(selectedLocation)
  })
}

const exportedObj = {
  getCurrent: getCurrent,
  setCurrent: setCurrent,
  getViewModel: getViewModel,
  getViewModelAll: getViewModelAll,
  handler: onChange
}

module.exports = exportedObj
