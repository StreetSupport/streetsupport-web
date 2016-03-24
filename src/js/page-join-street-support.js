// Common modules
import './common'

// Page modules
var Model = require('./models/JoinStreetSupportModel')
var ko = require('knockout')

ko.applyBindings(new Model())
