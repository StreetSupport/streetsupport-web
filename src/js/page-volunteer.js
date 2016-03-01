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
  var loading 

  var submitForm = function (e) {
    e.preventDefault()

    loading = new Spinner().spin(spin)

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
      console.log('loaded')
      console.log(result)
      loading.stop()
    })
  }

  var form = document.getElementById('jsForm')
  form.onsubmit = submitForm

  //loading.stop()
  socialShare.init()
})
