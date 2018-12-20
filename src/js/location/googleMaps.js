/* global google */

const buildMap = function (userLocation, customOptions = {}, domSelector = '.js-map') {
  const centre = { lat: userLocation.latitude, lng: userLocation.longitude }
  const defaultOptions = {
    zoom: 10,
    center: centre,
    draggable: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    fullscreenControl: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false
  }
  const updatedOptions = Object.assign(defaultOptions, customOptions)
  return new google.maps.Map(document.querySelector(domSelector), updatedOptions)
}

const buildMarker = function (location, map, customOptions) {
  const defaultOptions = {
    position: { lat: location.latitude, lng: location.longitude },
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

const Popup = function (lat, long, content) {
  const Popup = function (lat, long, content) {
    this.position = new google.maps.LatLng(lat, long)

    var newDiv = document.createElement('div')
    newDiv.innerHTML = content

    this.anchor = document.createElement('div')
    this.anchor.classList.add('card__gmaps-container')
    this.anchor.appendChild(newDiv)

    // Optionally stop clicks, etc., from bubbling up to the map.
    this.stopEventPropagation()
  }
  // NOTE: google.maps.OverlayView is only defined once the Maps API has
  // loaded. That is why Popup is defined inside initMap().
  Popup.prototype = Object.create(google.maps.OverlayView.prototype)

  /** Called when the popup is added to the map. */
  Popup.prototype.onAdd = function () {
    this.getPanes().floatPane.appendChild(this.anchor)

    document.querySelector('.js-popup-close')
      .addEventListener('click', () => {
        this.onRemove()
      })
  }

  /** Called when the popup is removed from the map. */
  Popup.prototype.onRemove = function () {
    if (this.anchor.parentElement) {
      this.anchor.parentElement.removeChild(this.anchor)
    }
  }

  /** Called when the popup needs to draw itself. */
  Popup.prototype.draw = function () {
    var divPosition = this.getProjection().fromLatLngToDivPixel(this.position)
    // Hide the popup when it is far out of view.
    var display =
      Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
        ? 'block'
        : 'none'

    if (display === 'block') {
      this.anchor.style.left = divPosition.x + 'px'
      this.anchor.style.top = divPosition.y + 'px'
    }
    if (this.anchor.style.display !== display) {
      this.anchor.style.display = display
    }
  }

  /** Stops clicks/drags from bubbling up to the map. */
  Popup.prototype.stopEventPropagation = function () {
    var anchor = this.anchor
    anchor.style.cursor = 'auto'

    const events = ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart', 'pointerdown']
    events
      .forEach(function (event) {
        anchor.addEventListener(event, function (e) {
          e.stopPropagation()
        })
      })
  }

  return new Popup(lat, long, content)
}

module.exports = {
  buildMap, buildMarker, buildInfoWindow, addCircleMarker, Popup
}
