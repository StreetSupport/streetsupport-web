// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var analytics = require('./analytics')

nav.init()
FastClick.attach(document.body)
analytics.init()
