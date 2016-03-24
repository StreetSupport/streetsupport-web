var FastClick = require('fastclick')
var nav = require('./nav.js')
var analytics = require('./analytics')

nav.init()
analytics.init()
FastClick.attach(document.body)
