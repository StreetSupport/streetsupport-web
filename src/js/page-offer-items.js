// Common modules
import './common'
const location = require('./location/locationSelector')

// Page modules
var ko = require('knockout')
var Form = require('./models/give-help/offer-items/OfferItemsModel')
var OfferItemsMap = require('./models/give-help/offer-items/OfferItemsMap')

location
  .getPreviouslySetPostcode()
  .then((currentLocation) => {
    const vm = {
      form: new Form(currentLocation.id),
      map: new OfferItemsMap(currentLocation)
    }
    ko.applyBindings(vm)
  })
