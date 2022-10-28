/* global describe, it, expect */

import { getData } from '../../../src/js/models/find-help/categories'

describe('Find Help categories', () => {
  const cityData = [
    {
      'id': 'leeds',
      'key': 'leeds',
      'name': 'Leeds',
      'latitude': 53.8021636002607,
      'longitude': -1.54851721145257,
      'swepIsAvailable': true,
      'isOpenToRegistrations': true,
      'isPublic': true,
      'postcode': 'LS1 1UR',
      'postcodeOfCentre': 'LS1 1UR'
    }
  ]

  describe('- category url manipulation', () => {
    it('- should set accommodation to new accommodation page', () => {
      const result = getData({
        id: 'an-area-id'
      }, cityData)

      expect(result.categories.find((c) => c.key === 'accom').page).toEqual('accommodation')
    })

    it('- should set dropin to timetabled page', () => {
      const result = getData({
        id: 'an-area-id'
      }, cityData)

      expect(result.categories.find((c) => c.key === 'dropin').page).toEqual('dropin/timetable')
    })

    it('- should set other categories\' page to be same as key', () => {
      const result = getData({
        id: 'an-area-id'
      }, cityData)

      expect(result.categories
        .filter((c) => !['accom', 'dropin'].includes(c.key))
        .filter((c) => c.key !== c.page)
        .length
      ).toEqual(0)
    })
  })
})
