// Common modules
import '../../../common'

// Page modules
const ko = require('knockout')
const Listing = require('../../../models/accommodation/listing')
const Map = require('../../../models/accommodation/map')

const listing =  new Listing("&hasLocation=true")
const map = new Map()

listing.items.subscribe((newItems) => {
  map.init(newItems)
})

ko.applyBindings({
  listing,
  map
})
