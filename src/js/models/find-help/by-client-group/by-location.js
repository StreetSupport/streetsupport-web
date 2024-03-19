/* global google */

import FindHelp from './FindHelp'
import { buildInfoWindowMarkup } from '../../../pages/find-help/by-location/helpers'
import ko from 'knockout'

require('../../../arrayExtensions')

const htmlEncode = require('htmlencode')
const ajax = require('../../../get-api-data')
const browser = require('../../../browser')
const endpoints = require('../../../api')
const googleMaps = require('../../../location/googleMaps')
const proximityRanges = require('../../../location/proximityRanges')
const querystring = require('../../../get-url-parameter')

export default class FindHelpByClientGroup extends FindHelp {
  constructor () {
    super()
    const postcodeInQuerystring = querystring.parameter('postcode')

    this.isLoaded = false
    this.pageSize = 10000
    this.pageIndex = ko.observable(0)

    if (postcodeInQuerystring) {
      this.proximitySearch.postcode(postcodeInQuerystring)
      this.proximitySearch.search()
    }

    if (this.proximitySearch.hasCoords() && !this.isLoaded) {
      this.onProximitySearch()
    }

    browser.setOnHistoryPop((e) => {
      this.onBrowserHistoryBack(this, e)
    })
  }

  onProximitySearch () {
    this.isLoaded = true
    browser.loading()

    ajax
      .data(`${endpoints.serviceCategories}by-client-group?pageSize=${this.pageSize}&latitude=${this.proximitySearch.latitude}&longitude=${this.proximitySearch.longitude}&range=${this.proximitySearch.range()}&index=${this.pageIndex()}&clientGroup=${this.encodeClientGroupKey(this.clientGroup.clientGroupKey)}`)
      .then((result) => {
        this.items(result.data.providers)
        this.displayMap()
        this.pushHistory()

        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  onProximitySearchFail () {
    window.alert('Sorry, your postcode could not be found. Please try a different, nearby postcode. Alternatively, you can use just the first portion eg: "M1".')
  }

  displayMap () {
    let isEmptyItems = false

    if (this.items() != null && !this.items().length) {
      isEmptyItems = true
      // Map can't be inizialised without items
      this.items([{}])
    }

    const buildMap = () => {
      const zoom = proximityRanges.getByRange(this.proximitySearch.range())
      const center = { lat: this.proximitySearch.latitude, lng: this.proximitySearch.longitude }
      return googleMaps.buildMap(this.proximitySearch, { zoom, center })
    }

    const map = buildMap()
    let popup = null

    if (this.items() != null && this.items().length) {
      this.items()
        .forEach((p) => {
          if (!isEmptyItems) {
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
          }
        })
    }

    googleMaps.addCircleMarker(this.proximitySearch, map)
  }

  onBrowserHistoryBack (thisDoobrey, e) {
    if (e.state && e.state.postcode !== thisDoobrey.proximitySearch.postcode()) {
      thisDoobrey.proximitySearch.postcode(e.state.postcode)
      thisDoobrey.proximitySearch.search()
    }
  }
}
