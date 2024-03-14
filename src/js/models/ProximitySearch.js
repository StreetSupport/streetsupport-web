import ko from 'knockout'

const proximityRanges = require('../location/proximityRanges')
const postcodeLookup = require('../location/postcodes')
const storage = require('../storage')

export default class ProximitySearch {
  constructor (container = {}, overrideStoredPostcode = false, range = proximityRanges.defaultRange) {
    this.container = container
    this.range = ko.observable(range)
    this.ranges = ko.observableArray(proximityRanges.ranges)
    this.postcode = ko.observable()
    this.latitude = null
    this.longitude = null

    if (!overrideStoredPostcode) {
      const existingPostcodeInfo = storage.get(storage.keys.userLocationState)
      if (existingPostcodeInfo) {
        this.postcode(existingPostcodeInfo.postcode)
        this.latitude = existingPostcodeInfo.latitude
        this.longitude = existingPostcodeInfo.longitude
      }
    }
  }

  hasCoords () {
    return this.latitude !== null &&
           this.longitude !== null &&
           this.latitude !== undefined &&
           this.longitude !== undefined
  }

  search () {
    if (this.postcode()) {
      postcodeLookup.getCoords(
        this.postcode(),
        (postcodeResult) => {
          if (postcodeResult !== undefined && postcodeResult.outcode) {
            postcodeResult.postcode = postcodeResult.outcode
          }
          storage.set(storage.keys.userLocationState, postcodeResult)
          this.latitude = postcodeResult.latitude
          this.longitude = postcodeResult.longitude
          this.container.onProximitySearch(false, true)
        },
        (error) => {
          this.container.onProximitySearchFail(error)
        })
    }
  }
}
