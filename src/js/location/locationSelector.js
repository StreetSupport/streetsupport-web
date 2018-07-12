const Q = require('q')
const deviceGeo = require('./get-location')
const querystring = require('../get-url-parameter')
const supportedCities = require('./supportedCities')
const browser = require('../browser')
const cookies = require('../cookies')

import * as postcodes from './postcodes'
import * as storage from '../storage'

const myLocationId = 'my-location'

const _useMyLocation = (deferred) => {
  const defaultResolution = () => {
    let cityId = myLocationId
    const saved = cookies.get(cookies.keys.location)
    if (saved !== undefined && saved.length > 0) {
      cityId = supportedCities.get(saved).id
    }
    deferred.resolve({
      id: cityId,
      findHelpId: myLocationId,
      isSelected: true,
      latitude: 0,
      longitude: 0,
      name: 'my location',
      geoLocationUnavailable: true
    })
  }
  deviceGeo.location()
    .then((userLocation) => {
      let cityId = 'my-location'
      const saved = cookies.get(cookies.keys.location)
      if (cookies.get(cookies.keys.location) !== undefined && saved.length > 0) {
        cityId = supportedCities.get(saved).id
      }
      postcodes.getByCoords(userLocation.coords, (postcode) => {
        storage.set(storage.keys.userLocationState, {
          'postcode': postcode,
          'longitude': userLocation.coords.longitude,
          'latitude': userLocation.coords.latitude
        })
        deferred.resolve({
          id: cityId,
          findHelpId: myLocationId,
          isSelected: true,
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          name: 'my location',
          postcode: postcode
        })
      }, defaultResolution)
    }, () => {
      defaultResolution()
    })
}

const _useRequested = (deferred, locationInQueryString) => {
  const requestedCity = supportedCities.get(locationInQueryString)
  if (requestedCity !== undefined) {
    deferred.resolve(requestedCity)
  } else {
    alert('uh oh')
  }
}

const _useSaved = (deferred) => {
  const saved = cookies.get(cookies.keys.location)
  if (saved === 'elsewhere' && deviceGeo.isAvailable()) {
    _useMyLocation(deferred)
  } else if (saved !== undefined && saved.length > 0 && saved !== myLocationId) {
    deferred.resolve(supportedCities.get(saved))
  } else {
    alert('uh oh')
  }
}

const _determineLocationRetrievalMethod = () => {
  let method = _useSaved
  let id = ''

  const locationInQueryString = querystring.parameter('location')
  if (locationInQueryString === myLocationId && deviceGeo.isAvailable()) {
    method = _useMyLocation
  } else if (locationInQueryString !== 'undefined' && locationInQueryString.length > 0 && locationInQueryString !== myLocationId) {
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

const getSelectedLocationId = () => {
  const saved = cookies.get(cookies.keys.location) || 'elsewhere'
  if (cookies.get(cookies.keys.location) !== undefined && saved.length > 0) {
    return supportedCities.get(saved).id
  }
}

const getCurrent = () => {
  const deferred = Q.defer()
  const getLocation = _determineLocationRetrievalMethod()
  getLocation.method(deferred, getLocation.id)
  return deferred.promise
}

const buildLocationResult = (userLocationState) => {
  return {
    'id': 'my-location',
    'findHelpId': 'my-location',
    'name': 'my selected postcode',
    'longitude': userLocationState.longitude,
    'latitude': userLocationState.latitude,
    'isPublic': true,
    'isSelectableInBody': false,
    'postcode': userLocationState.postcode
  }
}

const getPreviouslySetPostcode = () => {
  const deferred = Q.defer()
  const userLocationState = storage.get(storage.keys.userLocationState)
  if (userLocationState) {
    deferred.resolve(buildLocationResult(userLocationState))
  } else {
    const getLocation = _determineLocationRetrievalMethod()
    getLocation.method(deferred, getLocation.id)
  }

  return deferred.promise
}

const setPostcode = (postcode, onSuccessCallback, onErrorCallback) => {
  postcodes.getCoords(postcode, (coordsResult) => {
    storage.set(storage.keys.userLocationState, coordsResult)
    onSuccessCallback(buildLocationResult(coordsResult))
  }, (error) => {
    onErrorCallback(error)
  })
}

const setCurrent = (newCity) => {
  if (newCity.length > 0) {
    const selectedCity = supportedCities.locations.find(c => c.id === newCity)
    storage.set(storage.keys.userLocationState, {
      'postcode': selectedCity.postcode,
      'longitude': selectedCity.longitude,
      'latitude': selectedCity.latitude
    })
    document.cookie = `${cookies.keys.location}=${newCity};expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/`
  }
}

/**
 * initialise location dropdown with selectorId inject a callback when location selector changes
 * @param {function} onChangeLocationCallback
 * @param {string} selectorId
 */
const onChange = (onChangeLocationCallback, selectorId = '.js-location-select') => {
  const locationSelector = document.querySelector(selectorId)
  locationSelector.addEventListener('change', () => {
    var selectedLocation = locationSelector.options[locationSelector.selectedIndex].value
    setCurrent(selectedLocation)
    onChangeLocationCallback(selectedLocation)
  })
}

const exportedObj = {
  getSelectedLocationId: getSelectedLocationId,
  getPreviouslySetPostcode: getPreviouslySetPostcode,
  setPostcode: setPostcode,
  getCurrent: getCurrent,
  setCurrent: setCurrent,
  handler: onChange
}

module.exports = exportedObj
