/* global google */

require('../../../arrayExtensions')

const htmlEncode = require('htmlencode')

const ajax = require('../../../get-api-data')
const browser = require('../../../browser')
const endpoints = require('../../../api')
const googleMaps = require('../../../location/googleMaps')
const proximityRanges = require('../../../location/proximityRanges')
const querystring = require('../../../get-url-parameter')

import FindHelpByClientGroup from './FindHelpByClientGroup'

import { buildInfoWindowMarkup } from '../../../pages/find-help/by-location/helpers'

import ko from 'knockout'

export default class FindHelpByCategory extends FindHelpByClientGroup {
  constructor () {
    super()
    const postcodeInQuerystring = querystring.parameter('postcode')

    this.isLoaded = false
    this.pageSize = 10000
    this.pageIndex = ko.observable(0)
    this.clientGroupKey = ko.observable()
    this.clientGroupName = ko.observable()

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
    this.clientGroupKey(querystring.parameter('key'))

    this.listingHref(`/find-help/by-client-group/?key=${querystring.parameter('key')}&postcode=${this.proximitySearch.postcode()}`)
    this.timetableHref(`/find-help/by-client-group/timetable/?key=${querystring.parameter('key')}&postcode=${this.proximitySearch.postcode()}`)
    this.mapHref(`/find-help/by-client-group/map/?key=${querystring.parameter('key')}&postcode=${this.proximitySearch.postcode()}`)

    ajax
      .data(`${endpoints.serviceCategories}${this.proximitySearch.latitude}/${this.proximitySearch.longitude}?range=${this.proximitySearch.range()}&pageSize=${this.pageSize}&index=${this.pageIndex()}&clientGroup=${this.clientGroupKey()}`)
      .then((result) => {
        this.clientGroupName(result.data.clientGroup.name)
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
