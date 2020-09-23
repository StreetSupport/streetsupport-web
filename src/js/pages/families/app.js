// Common modules
import '../../common'
// import 'select2'
import localStorage from '../../storage'

// import htmlEncode from 'htmlencode'

// const api = require('../../get-api-data')
// const browser = require('../../browser')
// const endpoints = require('../../api')
 const location = require('../../location/locationSelector')
// const MapBuilder = require('../../models/accommodation/MapBuilder')

const initSearch = function (currentLocationId) {
  // TODO: Add search
  if (currentLocationId) {

  } else {
    // TODO: Add message regarding choosing location
  }
}

const currentLocation = location.getCurrentHubFromCookies()

initSearch(currentLocation.id)
