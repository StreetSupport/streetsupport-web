/* global google */

require('../../arrayExtensions')

import ko from 'knockout'
const htmlEncode = require('htmlencode')

const ajax = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const googleMaps = require('../../location/googleMaps')
const proximityRanges = require('../../location/proximityRanges')
const querystring = require('../../get-url-parameter')

import ProximitySearch from '../ProximitySearch'
import FindHelpCategory from './FindHelpCategory'

import { buildInfoWindowMarkup } from '../../pages/find-help/by-location/helpers'

export default class FindHelpByCategory {
  constructor () {
    this.category = new FindHelpCategory()
    const postcodeInQuerystring = querystring.parameter('postcode')
    this.proximitySearch = new ProximitySearch(this, postcodeInQuerystring)
    this.items = ko.observableArray([])
    this.hasItems = ko.computed(() => this.items().length > 0, this)

    if (postcodeInQuerystring) {
      this.proximitySearch.postcode(postcodeInQuerystring)
      this.proximitySearch.search()
    }

    if (this.proximitySearch.latitude !== null &&
      this.proximitySearch.longitude !== null &&
      this.proximitySearch.latitude !== undefined &&
      this.proximitySearch.longitude !== undefined) {
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

  pushHistory () {
    const postcodeqs = querystring.parameter('postcode')

    const postcode = this.proximitySearch.postcode()

    if (postcode !== postcodeqs) {
      const kvps = [
        { key: 'postcode', value: postcode }
      ]
        .filter((kv) => kv.value !== undefined)

      const qs = kvps
        .map((kv) => `${kv.key}=${kv.value}`)
        .join('&')

      const history = {}
      kvps
        .forEach((kvp) => {
          history[kvp.key] = kvp.value
        })

      const newUrl = `?${qs}`
      browser.pushHistory(history, '', newUrl)
    }
  }
}
