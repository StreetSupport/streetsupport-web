// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var socialShare = require('./social-share')
var analytics = require('./analytics')

nav.init()
analytics.init()
FastClick.attach(document.body)

// Load and process data
require.ensure(['./api', 'spin.js', './post-api-data'], function (require) {
  var apiRoutes = require('./api')
  var postApi = require('./post-api-data')
  var Spinner = require('spin.js')

  // Spinner
  var spin = document.getElementById('spin')
  var form = document.getElementById('jsForm')
  var hideElement = function (element) {
    console.log('hide')
    element.className += ' hidden'
  }
  var showElement = function (element) {
    console.log('show')
    element.className = element.className.replace( /(?:^|\s)hidden(?!\S)/g , '')
  }
  var loading 

  var submitForm = function (e) {
    e.preventDefault()

    loading = new Spinner().spin(spin)
    hideElement(form)

    var payload = {
      'FirstName': document.getElementById('firstname').value,
      'LastName': document.getElementById('lastname').value,
      'Email': document.getElementById('email').value,
      'Telephone': document.getElementById('telephone').value,
      'Postcode': document.getElementById('postcode').value,
      'SkillsAndExperienceDescription': document.getElementById('skillsAndExperience').value,
      'AvailabilityDescription': document.getElementById('availability').value,
      'ResourcesDescription': document.getElementById('resources').value
    }

    postApi.post(apiRoutes.createVolunteerEnquiry, payload)
    .then(function (result) {
      loading.stop()
      showElement(document.getElementById('jsSuccessMessage'))
    })
  }

  form.onsubmit = submitForm

  //loading.stop()
  socialShare.init()
})
