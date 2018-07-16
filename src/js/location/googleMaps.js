/* global google */

const buildMap = function (userLocation, zoomLevel = 10, domSelector = '.js-map') {
  const centre = { lat: userLocation.latitude, lng: userLocation.longitude }
  return new google.maps.Map(document.querySelector(domSelector), {
    zoom: zoomLevel,
    center: centre,
    draggable: false
  })
}

const buildMarker = function (p, map, icon = '/assets/img/map-pin.png') {
  return new google.maps.Marker({
    position: { lat: p.latitude(), lng: p.longitude() },
    icon,
    map: map
  })
}

const buildInfoWindow = function (markup) {
  return new google.maps.InfoWindow({
    content: markup
  })
}

module.exports = {
  buildMap, buildMarker, buildInfoWindow
}
