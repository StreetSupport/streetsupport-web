// Common modules
import './common'
const location = require('./location/locationSelector')

// Page modules
var ko = require('knockout')
var Model = require('./models/VolunteerModel')

ko.applyBindings(new Model(location.getSelectedLocationId()), document.getElementById('js-form'))
