/* global google */

// Common modules
import '../../../common'
const htmlEncode = require('htmlencode')
const marked = require('marked')
marked.setOptions({ sanitize: true })

const ko = require('knockout')

const locationSelector = require('../../../location/locationSelector')
const googleMaps = require('../../../location/googleMaps')
const proximityRanges = require('../../../location/proximityRanges')

const OrgRetrieval = require('../../../models/all-organisations/listing')
const model = new OrgRetrieval()
ko.applyBindings(model)

let Popup

window.initMap = function () {

  Popup = function (position, content) {
    this.position = position;
    
    var newDiv = document.createElement("div"); 
    newDiv.innerHTML = content

    this.anchor = document.createElement('div');
    this.anchor.classList.add('card__gmaps-container');
    this.anchor.appendChild(newDiv);

    // Optionally stop clicks, etc., from bubbling up to the map.
    this.stopEventPropagation();
  };
  // NOTE: google.maps.OverlayView is only defined once the Maps API has
  // loaded. That is why Popup is defined inside initMap().
  Popup.prototype = Object.create(google.maps.OverlayView.prototype);

  /** Called when the popup is added to the map. */
  Popup.prototype.onAdd = function () {
    this.getPanes().floatPane.appendChild(this.anchor);
  };

  /** Called when the popup is removed from the map. */
  Popup.prototype.onRemove = function () {
    if (this.anchor.parentElement) {
      this.anchor.parentElement.removeChild(this.anchor);
    }
  };

  /** Called when the popup needs to draw itself. */
  Popup.prototype.draw = function () {
    var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
    // Hide the popup when it is far out of view.
    var display =
      Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
        'block' :
        'none';

    if (display === 'block') {
      this.anchor.style.left = divPosition.x + 'px';
      this.anchor.style.top = divPosition.y + 'px';
    }
    if (this.anchor.style.display !== display) {
      this.anchor.style.display = display;
    }
  };

  /** Stops clicks/drags from bubbling up to the map. */
  Popup.prototype.stopEventPropagation = function () {
    var anchor = this.anchor;
    anchor.style.cursor = 'auto';

    ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
      'pointerdown']
      .forEach(function (event) {
        anchor.addEventListener(event, function (e) {
          e.stopPropagation();
        });
      });
  };

  const buildInfoWindowMarkup = (p) => {
    return `<div class="card card--brand-h card--gmaps">
              <div class="card__title">
                <h1 class="h2">${htmlEncode.htmlDecode(p.name)}</h1>
              </div>
              <div class="card__details">
                <a href="/find-help/organisation/?organisation=${p.key}">View details</a>
              </div>
            </div>`
  }

  const displayMap = function (providers, userLocation) {
    const map = googleMaps.buildMap(userLocation, { zoom: proximityRanges.getByRange(model.range()) })
    let popup = null

    providers
      .forEach((p) => {
        p.locations
          .forEach((l) => {
            const marker = googleMaps.buildMarker(l, map, { title: `${htmlEncode.htmlDecode(p.name)}` })
            marker.spKey = l.serviceProviderKey

            google.maps.event.addListener(marker, 'click', function (...args) {
              document.querySelectorAll('.card__gmaps-container')
                .forEach((p) => p.parentNode.removeChild(p))
              popup = new Popup(
                new google.maps.LatLng(this.position.lat(), this.position.lng()),
                buildInfoWindowMarkup(p))
              popup.setMap(map)
            })
          })
      })

    googleMaps.addCircleMarker(userLocation, map)
  }

  model.organisations.subscribe((newValue) => {
    locationSelector
      .getPreviouslySetPostcode()
      .then((result) => {
        displayMap(newValue, result)
      })
  })

}
