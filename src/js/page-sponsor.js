// Common modules
import './common'

// Page modules
var Model = require('./models/SponsorModel')
var ko = require('knockout')

ko.applyBindings(new Model())
