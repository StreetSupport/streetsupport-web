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

    it('- should set meals to timetabled page', () => {
      const result = getData({
        id: 'an-area-id'
      }, cityData)

      expect(result.categories.find((c) => c.key === 'meals').page).toEqual('meals/timetable')
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
        .filter((c) => !['accom', 'meals', 'dropin'].includes(c.key))
        .filter((c) => c.key !== c.page)
        .length
      ).toEqual(0)
    })
  })

  describe('- emergency help url for specific area', () => {
    it('- should set to {area-id}/emergency-help', () => {
      const result = getData({
        id: 'an-area-id'
      }, cityData)

      expect(result.emergencyHelpUrl).toEqual('/an-area-id/emergency-help/')
    }, cityData)
  })

  describe('- emergency help url for other area', () => {
    it('- should set to find-help/emergency-help', () => {
      const result = getData({
        id: 'elsewhere'
      }, cityData)

      expect(result.emergencyHelpUrl).toEqual('/find-help/emergency-help/')
    }, cityData)
  })

  describe('- swep notification', () => {
    it('- should set as requested city\'s swep status', () => {
      const locationInfo = {
        id: 'leeds'
      }
      const result = getData(locationInfo, cityData)
      expect(result.location.swepIsAvailable).toEqual(cityData[0].swepIsAvailable)
    }, cityData)
  })
})
