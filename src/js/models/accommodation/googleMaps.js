/* global google */

const buildMap = function (userLocation, zoomLevel = 10) {
  const centre = { lat: userLocation.latitude, lng: userLocation.longitude }
  return new google.maps.Map(document.querySelector('.js-map'), {
    zoom: zoomLevel,
    center: centre,
    draggable: false
  })
}

const buildMarker = function (p, map) {
  return new google.maps.Marker({
    position: { lat: p.latitude, lng: p.longitude },
    icon: `http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=${p.mapIndex + 1}|FE6256|000000`,
    map: map
  })
}

const buildInfoWindow = function (p, markup) {
  return new google.maps.InfoWindow({
    content: markup
  })
}

module.exports = {
  buildMap, buildMarker, buildInfoWindow
}
