function emailValidation (callback) {
  // This regex pattern was found here http://www.alpacajs.org/docs/fields/email.html
  var re = new RegExp(/^[a-z0-9!\#\$%&'\*\-\/=\?\+\-\^_`\{\|\}~]+(?:\.[a-z0-9!\#\$%&'\*\-\/=\?\+\-\^_`\{\|\}~]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i)
  var value = this.getValue()
  if (!re.test(value)) {
    callback({
      status: false,
      message: 'Invalid Email address e.g. info@cloudcms.com'
    })
    return
  }
  callback({
    status: true
  })
}

function urlValidation (callback) {
  // This regex pattern was found here https://mathiasbynens.be/demo/url-regex
  var re = new RegExp(/^(((ftp|https?):\/\/[-\w]+(\.\w[-\w]*)+|(?:[a-z0-9](?:[-a-z0-9]*[a-z0-9])?\.)+(?: com\b|edu\b|biz\b|gov\b|in(?:t|fo)\b|mil\b|net\b|org\b|[a-z][a-z]\b))(\:\d+)?(\/[^.!,?;"'<>()\[\]{}\s\x7F-\xFF]*(?:[.!,?]+[^.!,?;"'<>()\[\]{}\s\x7F-\xFF]+)*)?)?$/i)
  var value = this.getValue()
  if (!re.test(value)) {
    callback({
      status: false,
      message: 'The URL provided is not a valid web address.'
    })
    return
  }
  callback({
    status: true
  })
}

module.exports = {
  hideInitValidationError: true,
  fields: {
    name: {
      placeholder: 'The name of your organisation.'
    },
    associatedLocationIds: {
      multiple: true,
      size: 5
    },
    shortDescription: {
      type: 'textarea',
      placeholder: 'A short description of your organisation.'
    },
    longDescription: {
      type: 'textarea',
      placeholder: 'A more detailed description of your organisation.'
    },
    adminEmail: {
      placeholder: 'Email address of the administrator.',
      'validator': emailValidation
    },
    email: {
      placeholder: 'Email address to contact your organisation.',
      'validator': emailValidation
    },
    website: {
      placeholder: 'eg https://streetsupport.net',
      'validator': urlValidation
    },
    facebook: {
      placeholder: 'eg https://facebook.com/streetsupport',
      'validator': urlValidation
    },
    twitter: {
      placeholder: 'eg https://twitter.com/streetsupportuk',
      'validator': urlValidation
    },
    addresses: {
      label: 'Addresses',
      helper: 'Add the location(s) of your premises.',
      toolbarSticky: true,
      hideToolbarWithChildren: false,
      toolbar: {
        showLabels: true,
        actions: [{
          label: 'Add new Address',
          action: 'add'
        }]
      },
      actionbar: {
        actions: [{
          action: 'add',
          enabled: false
        }]
      },
      fields: {
        item: {
          fields: {
            addressLine1: {
              label: 'Street Line 1'
            },
            postcode: {
              label: 'Postcode'
            },
            openingTimes: {
              toolbarSticky: true,
              hideToolbarWithChildren: false,
              toolbar: {
                showLabels: true,
                actions: [{
                  label: 'Add new Time Slot',
                  action: 'add'
                }]
              },
              actionbar: {
                actions: [{
                  action: 'add',
                  enabled: false
                }]
              },
              label: 'Opening Times',
              helper: 'Add the opening times of this location.',
              fields: {
                item: {
                  fields: {
                    day: {
                      optionLabels: [
                        'Sunday',
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday'
                      ],
                      sort: false,
                      hideNone: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
