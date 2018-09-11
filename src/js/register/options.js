module.exports = {
  'hideInitValidationError': true,
  'fields': {
    'name': {
      'placeholder': 'The name of your organisation.'
    },
    'associatedLocationIds': {
      'multiple': true,
      'size': 5
    },
    'shortDescription': {
      'type': 'textarea',
      'placeholder': 'A short description of your organisation.'
    },
    'longDescription': {
      'type': 'textarea',
      'placeholder': 'A more detailed description of your organisation.'
    },
    'adminEmail': {
      'placeholder': 'Email address of the administrator.'
    },
    'email': {
      'placeholder': 'Email address to contact your organisation.'
    },
    'website': {
      'placeholder': 'eg https://streetsupport.net'
    },
    'facebook': {
      'placeholder': 'eg https://facebook.com/streetsupport'
    },
    'twitter': {
      'placeholder': 'eg https://twitter.com/streetsupportuk'
    },
    'addresses': {
      'label': 'Addresses',
      'helper': 'Add the location(s) of your premises.',
      'toolbarSticky': true,
      'hideToolbarWithChildren': false,
      'toolbar': {
        'showLabels': true,
        'actions': [{
          'label': 'Add new Address',
          'action': 'add'
        }]
      },
      'actionbar': {
        'actions': [{
          'action': 'add',
          'enabled': false
        }]
      },
      'fields': {
        'item': {
          'fields': {
            'addressLine1': {
              'label': 'Street Line 1'
            },
            'postcode': {
              'label': 'Postcode'
            },
            'openingTimes': {
              'toolbarSticky': true,
              'hideToolbarWithChildren': false,
              'toolbar': {
                'showLabels': true,
                'actions': [{
                  'label': 'Add new Time Slot',
                  'action': 'add'
                }]
              },
              'actionbar': {
                'actions': [{
                  'action': 'add',
                  'enabled': false
                }]
              },
              'label': 'Opening Times',
              'helper': 'Add the opening times of this location.',
              'fields': {
                'item': {
                  'fields': {
                    'day': {
                      'optionLabels': [
                        'Sunday',
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday'
                      ],
                      'sort': false,
                      'hideNone': true
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
