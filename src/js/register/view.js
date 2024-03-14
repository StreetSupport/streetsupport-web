/* global $, console */

const browser = require('../browser')
const endpoints = require('../api')
const ajax = require('../post-api-data')

module.exports = {
  parent: 'bootstrap-edit-horizontal',
  wizard: {
    title: 'Welcome to the Wizard',
    description: 'Please fill things in as you wish',
    bindings: {
      name: 1,
      city: 1,
      shortDescription: 1,
      longDescription: 1,
      telephone: 2,
      email: 2,
      website: 2,
      facebook: 2,
      twitter: 2,
      addresses: 3,
      adminEmail: 4
    },
    steps: [
      {
        title: 'Getting Started',
        description: 'Basic Information'
      },
      {
        title: 'Contact Details',
        description: 'Contact Information'
      }, {
        title: 'Locations',
        description: 'Physical Locations'
      }, {
        title: 'Login Details',
        description: 'Access Street Support'
      }
    ],
    buttons: {
      submit: {
        title: 'All Done!',
        'validate': function (callback) {
          callback(true)
        },
        'click': function (e) {
          browser.loading()
          const formData = this.getValue()

          $('.form-errors').addClass('hide')

          ajax
            .post(endpoints.newlyRegisteredProviders, formData)
            .then((result) => {
              browser.loaded()
              if (result.statusCode === 201) browser.redirect('/register/thank-you')
              $('.form-errors').removeClass('hide')
              $('.form-errors__list').empty()
              for (var i = 0; i < result.messages.length; i++) {
                $('.form-errors__list').append('<li>' + result.messages[i] + '</li>')
              }
            }, () => {
              browser.redirect('/500/')
            })
        }
      }
    }
  }
}
