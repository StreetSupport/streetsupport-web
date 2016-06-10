/* global location, history */

var ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!

var apiRoutes = require('../api')
var postApi = require('../post-api-data')
var Spinner = require('spin.js')

var formId = 'js-form'
var failId = 'js-fail'
var successId = 'js-success'
var theForm = document.getElementById(formId)
var theFail = document.getElementById(failId)
var theSuccess = document.getElementById(successId)
var hideClass = 'hide'

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
  self.isOptedIn = ko.observable(false)

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
        'ResourcesDescription': document.getElementById('resources').value,
        'IsOptedIn': document.getElementById('isOptedIn').value
      }

      // TODO: Nice notification on success/fail
      postApi.post(apiRoutes.createVolunteerEnquiry, payload).then(function (result) {
        loading.stop()
        if (result.statusCode.toString().charAt(0) !== '2') {
          theForm.classList.add(hideClass)
          theFail.classList.remove(hideClass)
        } else {
          theForm.classList.add(hideClass)
          theSuccess.classList.remove(hideClass)
        }
      })
    } else {
      self.errors.showAllMessages()

      // Jump to top of form
      var url = location.href
      location.href = '#' + formId
      history.replaceState(null, null, url)
    }
  }

  self.errors = ko.validation.group(self)
}

module.exports = VolunteerModel
