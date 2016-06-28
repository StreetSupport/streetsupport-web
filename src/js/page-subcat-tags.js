const templating = require('./template-render')

const template = 'js-category-result-tpl'
const data = {
  'category': {
    'id': 'support',
    'name': 'Advice',
    'synopsis': 'Advice, support, and help with referrals.',
    'providers': [
      {
        'key': 'lifeshare',
        'name': 'Lifeshare',
        'services': [
          {
            'serviceInfo': 'CARDS targets vulnerable and marginalized young people aged 16-25 in Manchester, particularly those who are homeless (or at risk of becoming so) and those at risk of being sexually exploited. Contact us to make an appointment and join the CARDS project. Our aims are to ensure they have safe, stable accommodation, work towards positive mental well being and good physical health. We also seek to improve our clients financial situation and prospects for employment.',
            'subCategories': [
              {
                'name': 'Support for younger people',
                'key': 'younger-people'
              }
            ],
            'address': {
              'key': '15fcd356-f8ab-4302-bdc0-36960b223c3a',
              'street': '1st floor',
              'street1': '27 Houldsworth Street',
              'street2': null,
              'street3': null,
              'city': 'Manchester',
              'postcode': 'M1 1EB',
              'openingTimes': []
            },
            'openingTimes': [{
              'startTime': '09:30',
              'endTime': '17:00',
              'day': 'Monday'
            }, {
              'startTime': '09:30',
              'endTime': '17:00',
              'day': 'Tuesday'
            }, {
              'startTime': '09:30',
              'endTime': '17:00',
              'day': 'Wednesday'
            }, {
              'startTime': '09:30',
              'endTime': '17:00',
              'day': 'Thursday'
            }, {
              'startTime': '09:30',
              'endTime': '17:00',
              'day': 'Friday'
            }],
            'tags': ['Young people from 16-25 who are homeless or at risk of becoming so.'],
            'locationDescription': null
          }, {
            'serviceInfo': 'Support and advocacy available to clients',
            'subCategories': [
              {
                'name': 'General support',
                'key': 'general'
              },
              {
                'name': 'Housing support',
                'key': 'housing'
              },
              {
                'name': 'Ex-Offenders\u0027 support',
                'key': 'ex-offender'
              },
              {
                'name': 'Dependency support',
                'key': 'dependency'
              },
              {
                'name': 'Sex worker support',
                'key': 'sexwork'
              },
              {
                'name': 'LGBT support',
                'key': 'lgbt'
              }
            ],
            'address': {
              'key': '15fcd356-f8ab-4302-bdc0-36960b223c3a',
              'street': '1st floor',
              'street1': '27 Houldsworth Street',
              'street2': null,
              'street3': null,
              'city': 'Manchester',
              'postcode': 'M1 1EB',
              'openingTimes': [{
                'startTime': '10:00',
                'endTime': '16:00',
                'day': 'Monday'
              }, {
                'startTime': '10:00',
                'endTime': '16:00',
                'day': 'Tuesday'
              }, {
                'startTime': '10:00',
                'endTime': '16:00',
                'day': 'Wednesday'
              }, {
                'startTime': '10:00',
                'endTime': '16:00',
                'day': 'Thursday'
              }, {
                'startTime': '10:00',
                'endTime': '16:00',
                'day': 'Friday'
              }]
            },
            'openingTimes': [{
              'startTime': '10:00',
              'endTime': '16:00',
              'day': 'Monday'
            }, {
              'startTime': '10:00',
              'endTime': '16:00',
              'day': 'Tuesday'
            }, {
              'startTime': '10:00',
              'endTime': '16:00',
              'day': 'Wednesday'
            }, {
              'startTime': '10:00',
              'endTime': '16:00',
              'day': 'Thursday'
            }, {
              'startTime': '10:00',
              'endTime': '16:00',
              'day': 'Friday'
            }],
            'tags': ['16-25'],
            'locationDescription': ''
          }
        ]
      }
    ]
  }
}
const callback = () => {
  console.log('rendered')
}

templating.renderTemplate(template, data, 'js-category-result-output', callback)
