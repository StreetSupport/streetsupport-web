/* global google */

const buildMap = function (userLocation, customOptions = {}, domSelector = '.js-map') {
  const centre = { lat: userLocation.latitude, lng: userLocation.longitude }
  const defaultOptions = {
    zoom: 10,
    center: centre,
    draggable: true
  }
  const updatedOptions = Object.assign(defaultOptions, customOptions)
  return new google.maps.Map(document.querySelector(domSelector), updatedOptions)
}

const buildMarker = function (location, map, customOptions) {
  const defaultOptions = {
    position: { lat: location.latitude, lng: location.longitude },
    icon: '/assets/img/map-pin.png',
    map: map
  }
  return new google.maps.Marker(Object.assign(defaultOptions, customOptions))
}

const buildInfoWindow = function (markup) {
  return new google.maps.InfoWindow({
    content: markup
  })
}

const addCircleMarker = function (location, map) {
  const position = {
    lat: location.latitude,
    lng: location.longitude
  }
  new google.maps.Marker({ // eslint-disable-line
    position,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 3,
      fillColor: 'blue',
      strokeColor: 'green'
    },
    map
  })
}

module.exports = {
  buildMap, buildMarker, buildInfoWindow, addCircleMarker
}
