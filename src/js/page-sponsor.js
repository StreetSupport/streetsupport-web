import './common'
var ko = require('knockout')
var Model = require('./models/SponsorModel')

ko.applyBindings(new Model())
