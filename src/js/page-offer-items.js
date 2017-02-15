// Common modules
import './common'
const location = require('./location/locationSelector')

// Page modules
var ko = require('knockout')
var Form = require('./models/OfferItemsModel')
var OfferItemsMap = require('./models/OfferItemsMap')

location
  .getCurrent()
  .then((currentLocation) => {
    const vm = {
      form: new Form(currentLocation.id, document.querySelector('.block--requests-detail')),
      map: new OfferItemsMap(currentLocation, document.querySelector('.js-org-needs'))
    }
    ko.applyBindings(vm)
  })
