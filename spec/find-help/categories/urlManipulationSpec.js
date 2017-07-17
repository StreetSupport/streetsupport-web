/* global describe, it, expect */

import { getData } from '../../../src/js/models/find-help/categories'

describe('Find Help category url manipulation', () => {

  it('- should set accommodation to new accommodation page', () => {
    const result = getData({
      id: 'a-location-id'
    })

    expect(result.categories.find((c) => c.key === 'accom').page).toEqual('accommodation')
  })

  it('- should set meals to timetabled page', () => {
    const result = getData({
      id: 'a-location-id'
    })

    expect(result.categories.find((c) => c.key === 'meals').page).toEqual('meals/timetable')
  })

  it('- should set dropin to timetabled page', () => {
    const result = getData({
      id: 'a-location-id'
    })

    expect(result.categories.find((c) => c.key === 'dropin').page).toEqual('dropin/timetable')
  })

  it('- should set other categories\' page to be same as key', () => {
    const result = getData({
      id: 'a-location-id'
    })

    expect(result.categories
      .filter((c) => !['accom', 'meals', 'dropin'].includes(c.key))
      .filter((c) => c.key !== c.page)
      .length
    ).toEqual(0)
  })
})
