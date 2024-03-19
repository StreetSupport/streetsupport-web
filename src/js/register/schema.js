module.exports = {
  type: 'object',
  properties: {
    name: {
      title: 'Organisation Name',
      type: 'string',
      required: true
    },
    associatedLocationIds: {
      title: 'Associated Locations (ctrl + click to select multiple locations)',
      type: 'select',
      enum: ['bcp', 'leeds', 'manchester'], // this gets overwritten by gulp task 'supported-cities'
      required: true
    },
    shortDescription: {
      title: 'Synopsis',
      type: 'string',
      required: true,
      maxLength: 150
    },
    longDescription: {
      title: 'Description',
      type: 'string'
    },
    telephone: {
      title: 'Telephone Number',
      description: 'Telephone number',
      type: 'string'
    },
    email: {
      title: 'Contact Email Address',
      description: 'Email address for people to get in contact',
      type: 'string',
      required: true
    },
    website: {
      title: 'Your website',
      description: 'THe URL of your website',
      type: 'string'
    },
    facebook: {
      title: 'Your facebook page',
      description: 'The URL of your Facebook page',
      type: 'string'
    },
    twitter: {
      title: 'Your Twitter page',
      description: 'The URL of your Twitter page',
      type: 'string'
    },
    addresses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          addressLine1: {
            title: 'Street Line 1',
            type: 'string',
            required: true
          },
          addressLine2: {
            title: 'Street Line 2',
            type: 'string'
          },
          addressLine3: {
            title: 'Street Line 3',
            type: 'string'
          },
          addressLine4: {
            title: 'Street Line 4',
            type: 'string'
          },
          city: {
            title: 'Town/City',
            type: 'string',
            required: true
          },
          postcode: {
            title: 'Postcode',
            type: 'string',
            required: true
          },
          openingTimes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: {
                  title: 'Day',
                  type: 'select',
                  enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
                  default: 'sunday'
                },
                startTimeHour: {
                  title: 'Start Hour',
                  type: 'select',
                  enum: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
                    '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
                  default: '00'
                },
                startTimeMinute: {
                  title: 'Start Minute',
                  type: 'select',
                  enum: ['00', '15', '30', '45'],
                  default: '00'
                },
                endTimeHour: {
                  title: 'End Hour',
                  type: 'select',
                  enum: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
                    '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
                  default: '00'
                },
                endTimeMinute: {
                  title: 'End Minute',
                  type: 'select',
                  enum: ['00', '15', '30', '45'],
                  default: '00'
                }
              }
            }
          }
        }
      }
    },
    adminEmail: {
      title: 'Administrator\'s Email Address',
      type: 'string',
      format: 'email',
      required: true
    }
  }
}
