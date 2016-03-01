var ko = require('knockout')
var apiRoutes = require('../api')
var postApi = require('../post-api-data')
var Spinner = require('spin.js')

var VolunteerModel = function () {
  var self = this

  var pageElementIds = {
  	'spinner': 'spin',
  	'form': 'jsForm',
    'successMessage': 'jsSuccessMessage'
  }
  // browser crap
  var spin = document.getElementById(pageElementIds.spinner)
  var form = document.getElementById(pageElementIds.form)
  var successMessage = document.getElementById(pageElementIds.successMessage)

  var hideElement = function (element) {
    element.className += ' hidden'
  }
  var showElement = function (element) {
    element.className = element.className.replace( /(?:^|\s)hidden(?!\S)/g , '')
  }

  self.errorMessages = ko.observableArray()

  self.hasErrors = ko.computed(function () {
  	return self.errorMessages().length > 0
  })

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
      if (result.statusCode.toString().charAt(0) !== '2') {
      	self.errorMessages(result.messages)
        showElement(form)
      } else {
        showElement(successMessage)
      }
    })
  }

  form.onsubmit = submitForm
}

module.exports = VolunteerModel
