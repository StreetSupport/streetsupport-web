// Common modules
import './common'

// Page modules
var Model = require('./models/GiveItemModel')
var ko = require('knockout')

ko.applyBindings(new Model())
