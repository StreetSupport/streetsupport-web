// Common modules
import '../../common'

import htmlEncode from 'htmlencode'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const location = require('../../location/locationSelector')
const MapBuilder = require('../../models/accommodation/MapBuilder')

const initSearch = function (currentLocationId) {
  // TODO: Add search
}

const currentLocation = location.getCurrentHub()

initSearch(currentLocation.id)
