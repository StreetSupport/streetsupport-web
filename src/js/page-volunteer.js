// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var socialShare = require('./social-share')
var analytics = require('./analytics')

nav.init()
analytics.init()
FastClick.attach(document.body)

// Load and process data
require.ensure(['knockout', './models/VolunteerModel'], function (require) {
  var ko = require('knockout')
  var Model = require('./models/VolunteerModel')

  ko.applyBindings(new Model(), document.getElementById('jsForm'))

  socialShare.init()
})
