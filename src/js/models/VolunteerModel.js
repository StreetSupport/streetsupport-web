var ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!

var apiRoutes = require('../api')
var postApi = require('../post-api-data')
var Spinner = require('spin.js')

var VolunteerModel = function () {
  var self = this

  ko.validation.init({
    insertMessages: true,
    decorateInputElement: true,
    parseInputAttributes: true,
    errorMessageClass: 'form__error',
    errorElementClass: 'form__input--error'
  }, true)

  self.firstName = ko.observable('').extend({ required: true })
  self.lastName = ko.observable('').extend({ required: true })
  self.email = ko.observable('').extend({ required: true })
  self.telephone = ko.observable('')
  self.postcode = ko.observable('').extend({ required: true })
  self.skillsAndExperience = ko.observable('')
  self.availability = ko.observable('')
  self.resources = ko.observable('')

  self.submitForm = function () {
    var loading
    var spin = document.getElementById('spin')

    if (self.errors().length === 0) {
      loading = new Spinner().spin(spin)

      // TODO: Use knockout stuff for this
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

      // TODO: Nice notification on success/fail
      postApi.post(apiRoutes.createVolunteerEnquiry, payload).then(function (result) {
        loading.stop()
        if (result.statusCode.toString().charAt(0) !== '2') {
          // showElement(form)
          alert('server submitted')
        } else {
          alert('server error')
          //showElement(successMessage)
        }
      })

    } else {
      self.errors.showAllMessages()

      // Jump to top of form
      var url = location.href
      location.href = "#jsForm"
      history.replaceState(null, null, url)
    }
  }

  self.errors = ko.validation.group(self)

  /*
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
    element.className = element.className.replace(/(?:^|\s)hidden(?!\S)/g, '')
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

  */
}

module.exports = VolunteerModel
