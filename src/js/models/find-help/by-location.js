/* global google */

require('../../arrayExtensions')

const htmlEncode = require('htmlencode')

const ajax = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const googleMaps = require('../../location/googleMaps')
const proximityRanges = require('../../location/proximityRanges')
const querystring = require('../../get-url-parameter')

import FindHelp from './FindHelp'

import { buildInfoWindowMarkup } from '../../pages/find-help/by-location/helpers'

export default class FindHelpByCategory extends FindHelp {
  constructor () {
    super()
    const postcodeInQuerystring = querystring.parameter('postcode')

    if (postcodeInQuerystring) {
      this.proximitySearch.postcode(postcodeInQuerystring)
      this.proximitySearch.search()
    }

    if (this.proximitySearch.hasCoords()) {
      this.onProximitySearch()
    }

    browser.setOnHistoryPop((e) => {
      this.onBrowserHistoryBack(this, e)
    })
  }

  onProximitySearch () {
    browser.loading()
    ajax
      .data(`${endpoints.serviceCategories}${this.category.categoryId}/${this.proximitySearch.latitude}/${this.proximitySearch.longitude}?range=${this.proximitySearch.range()}`)
      .then((result) => {
        this.items(result.data.providers)

        this.displayMap()
        this.pushHistory()

        browser.loaded()
      })
  }

  onProximitySearchFail () {
    window.alert('Sorry, your postcode could not be found. Please try a different, nearby postcode. Alternatively, you can use just the first portion eg: "M1".')
  }

  displayMap () {
    const buildMap = () => {
      const zoom = proximityRanges.getByRange(this.proximitySearch.range())
      const center = { lat: this.proximitySearch.latitude, lng: this.proximitySearch.longitude }

      return googleMaps.buildMap(this.proximitySearch, { zoom, center })
    }

    const map = buildMap()

    let popup = null

    this.items()
      .forEach((p) => {
        const marker = googleMaps.buildMarker(p.location, map, { title: `${htmlEncode.htmlDecode(p.serviceProviderName)}` })

        marker.addListener('click', function () {
          document.querySelectorAll('.card__gmaps-container')
            .forEach((p) => p.parentNode.removeChild(p))
          popup = new googleMaps.Popup(
            this.position.lat(),
            this.position.lng(),
            buildInfoWindowMarkup(p))
          popup.setMap(map)
          map.setCenter(new google.maps.LatLng(this.position.lat(), this.position.lng()))
        })
      })

    googleMaps.addCircleMarker(this.proximitySearch, map)
  }

  onBrowserHistoryBack (thisDoobrey, e) {
    if (e.state && e.state.postcode !== thisDoobrey.proximitySearch.postcode()) {
      thisDoobrey.proximitySearch.postcode(e.state.postcode)
      thisDoobrey.proximitySearch.search()
    }
  }
}
