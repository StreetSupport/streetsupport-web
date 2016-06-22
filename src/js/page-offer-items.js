// Common modules
import './common'

// Page modules
var ko = require('knockout')
var Model = require('./models/OfferItemsModel')

ko.applyBindings(new Model(), document.getElementById('js-form'))
