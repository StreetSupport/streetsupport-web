// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var Holder = require('holderjs') // eslint-disable-line

nav.init()
FastClick.attach(document.body)
