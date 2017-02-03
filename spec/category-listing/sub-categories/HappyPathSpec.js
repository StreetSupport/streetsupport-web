/* global describe, it, expect */

import { getSubCategories } from '../../../src/js/pages/find-help/provider-listing/helpers'

describe('Sub-Category Filter items', () => {
  it('- should return unique set of sub-categories', () => {
    const result = getSubCategories(providerData)
    expect(result.length).toEqual(4)
  })
})

const providerData = [
  {
    'id': '57d65bf3870542339c2378a7',
    'categoryId': 'accom',
    'categoryName': 'Accommodation',
    'categorySynopsis': 'Permanent and temporary accommodation options. Please read our [emergency advice section](https://streetsupport.net/find-help/emergency-help/), or visit one of the [housing support agencies](https://streetsupport.net/find-help/category/?category=support&sub-category=housing) for advice on finding accommodation.',
    'info': 'People First is in business to deliver services that will improve the lives of as many people as possible.  We own and manage high quality housing in Hulme, Manchester and provide community support services across North-West England. We provide support in helping people move from temporary accommodation. ',
    'tags': [
      'Homeless or at risk'
    ],
    'locationDescription': 'Our City Road East location',
    'location': {
      'description': '',
      'streetLine1': '1 City Road',
      'streetLine2': 'City Road East',
      'streetLine3': '',
      'streetLine4': '',
      'city': 'Manchester',
      'postcode': 'M15 4PN',
      'latitude': 53.4722233243208,
      'longitude': -2.24816217051489
    },
    'openingTimes': [
      {
        'startTime': '09:00',
        'endTime': '17:00',
        'day': 'Monday'
      },
      {
        'startTime': '20:00',
        'endTime': '03:00',
        'day': 'Monday'
      },
      {
        'startTime': '09:00',
        'endTime': '17:00',
        'day': 'Tuesday'
      }
    ],
    'serviceProviderId': 'people-first-housing',
    'serviceProviderName': 'People First Housing Association',
    'isPublished': true,
    'subCategories': [
      {
        'id': 'hosted',
        'name': 'Hosted'
      },
      {
        'id': 'social',
        'name': 'Social Housing'
      }
    ]
  },
  {
    'id': '580a725e1fc3d60ef438f285',
    'categoryId': 'accom',
    'categoryName': 'Accommodation',
    'categorySynopsis': 'Permanent and temporary accommodation options. Please read our [emergency advice section](https://streetsupport.net/find-help/emergency-help/), or visit one of the [housing support agencies](https://streetsupport.net/find-help/category/?category=support&sub-category=housing) for advice on finding accommodation.',
    'info': 'boaz night shelter info',
    'tags': [
      'Refused destitute asylum seekers',
      'and homeless refugees'
    ],
    'location': {
      'description': '',
      'streetLine1': 'address A',
      'streetLine2': '',
      'streetLine3': '',
      'streetLine4': '',
      'city': 'Manchester',
      'postcode': 'M4 6AG',
      'latitude': 53.4865827925854,
      'longitude': -2.22764482381055
    },
    'openingTimes': [
      {
        'startTime': '18:00',
        'endTime': '07:00',
        'day': 'Monday'
      },
      {
        'startTime': '18:00',
        'endTime': '07:00',
        'day': 'Tuesday'
      },
      {
        'startTime': '18:00',
        'endTime': '07:00',
        'day': 'Wednesday'
      },
      {
        'startTime': '18:00',
        'endTime': '07:00',
        'day': 'Thursday'
      },
      {
        'startTime': '18:00',
        'endTime': '07:00',
        'day': 'Friday'
      },
      {
        'startTime': '18:00',
        'endTime': '07:00',
        'day': 'Saturday'
      },
      {
        'startTime': '18:00',
        'endTime': '07:00',
        'day': 'Sunday'
      }
    ],
    'serviceProviderId': 'boaz-trust',
    'serviceProviderName': 'Boaz Trust',
    'isPublished': true,
    'subCategories': [
      {
        'id': 'shelter',
        'name': 'Night shelter'
      }
    ]
  },
  {
    'id': '57d65bec870542339c237886',
    'categoryId': 'accom',
    'categoryName': 'Accommodation',
    'categorySynopsis': 'Permanent and temporary accommodation options. Please read our [emergency advice section](https://streetsupport.net/find-help/emergency-help/), or visit one of the [housing support agencies](https://streetsupport.net/find-help/category/?category=support&sub-category=housing) for advice on finding accommodation.',
    'info': 'Boaz helps organise hosted accommodation for refused destitute asylum seekers, and homeless refugees in Greater Manchester. Contact Boaz office for referral.',
    'tags': [
      'Refused destitute asylum seekers',
      'and homeless refugees.'
    ],
    'location': {
      'description': '',
      'streetLine1': 'address B',
      'streetLine2': '',
      'streetLine3': '',
      'streetLine4': '',
      'city': 'Manchester',
      'postcode': 'M4 6AG',
      'latitude': 53.4865827925854,
      'longitude': -2.22764482381055
    },
    'openingTimes': [
      {
        'startTime': '10:00',
        'endTime': '16:30',
        'day': 'Monday'
      },
      {
        'startTime': '10:00',
        'endTime': '16:30',
        'day': 'Tuesday'
      },
      {
        'startTime': '10:00',
        'endTime': '16:30',
        'day': 'Wednesday'
      },
      {
        'startTime': '10:00',
        'endTime': '16:30',
        'day': 'Thursday'
      },
      {
        'startTime': '10:00',
        'endTime': '16:30',
        'day': 'Friday'
      }
    ],
    'serviceProviderId': 'boaz-trust',
    'serviceProviderName': 'BOAZ Trust',
    'isPublished': true,
    'subCategories': [
      {
        'id': 'hosted',
        'name': 'Hosted'
      },
      {
        'id': 'supported',
        'name': 'Supported'
      }
    ]
  }
]
