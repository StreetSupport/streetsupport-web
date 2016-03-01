// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var socialShare = require('./social-share')
var analytics = require('./analytics')

nav.init()
analytics.init()
FastClick.attach(document.body)

// Load and process data
require.ensure(['knockout', './api', 'spin.js', './post-api-data', './models/VolunteerModel'], function (require) {
  var apiRoutes = require('./api')
  var postApi = require('./post-api-data')
  var Spinner = require('spin.js')
  var ko = require('knockout')
  var Model = require('./models/VolunteerModel')

  ko.applyBindings(new Model())

  socialShare.init()
})
