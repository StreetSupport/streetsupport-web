// Common modules
import './common'
const location = require('./location/locationSelector')

// Page modules
var ko = require('knockout')
var Form = require('./models/OfferItemsModel')

location
  .getCurrent()
  .then((currentLocation) => {
    ko.applyBindings(new Form(currentLocation.id, document.querySelector('.block--requests-detail')))
  })
