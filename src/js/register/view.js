/* global $, console */

let browser = require('../browser')
let endpoints = require('../api')
let ajax = require('../post-api-data')

module.exports = {
  'parent': 'bootstrap-edit-horizontal',
  'wizard': {
    'title': 'Welcome to the Wizard',
    'description': 'Please fill things in as you wish',
    'bindings': {
      'name': 1,
      'shortDescription': 1,
      'longDescription': 1,
      'telephone': 2,
      'email': 2,
      'website': 2,
      'facebook': 2,
      'twitter': 2,
      'addresses': 3,
      'adminEmail': 4
    },
    'steps': [
      {
        'title': 'Getting Started',
        'description': 'Basic Information'
      },
      {
        'title': 'Contact Details',
        'description': 'Contact Information'
      }, {
        'title': 'Locations',
        'description': 'Physical Locations'
      }, {
        'title': 'Login Details',
        'description': 'Access Street Support'
      }
    ],
    'buttons': {
      'submit': {
        'title': 'All Done!',
        'validate': function (callback) {
          console.log('Submit validate()')
          callback(true)
        },
        'click': function (e) {
          browser.loading()
          let formData = this.getValue()

          console.log(formData)

          ajax
            .post(endpoints.newlyRegisteredProviders, formData)
            .then((success) => {
              browser.redirect('/register/thank-you')
            }, () => {
              browser.redirect('/500/')
            })
        }
      }
    }
  }
}
