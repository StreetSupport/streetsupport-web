// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var socialShare = require('./social-share')
var analytics = require('./analytics')


nav.init()
analytics.init()
FastClick.attach(document.body)

// Load and process data
require.ensure(['./needs', './template-render', 'spin.js'], function (require) {
  var templating = require('./template-render')
  var Spinner = require('spin.js')
  var needs = require('./needs')

  // Spinner
  var spin = document.getElementById('spin')
  var loading = new Spinner().spin(spin)

  // Append object name for Hogan
  var theData = { needs: needs }

  console.log(theData)

  var callback = function () {
    loading.stop()
    //socialShare.init()
  }

  templating.renderTemplate('js-need-list-tpl', needs, 'js-need-list-output', callback)
}) 
