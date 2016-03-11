// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var analytics = require('./analytics')
var Model = require('./models/JoinStreetSupportModel')
var ko = require('knockout')

nav.init()
FastClick.attach(document.body)
analytics.init()

ko.applyBindings(new Model())
