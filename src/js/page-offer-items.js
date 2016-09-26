// Common modules
import './common'
const Location = require('./locationSelector')
const location = new Location()

// Page modules
var ko = require('knockout')
var Model = require('./models/OfferItemsModel')

location
  .getCurrent()
  .then((result) => {
    ko.applyBindings(new Model(result.id), document.getElementById('js-form'))
  })
