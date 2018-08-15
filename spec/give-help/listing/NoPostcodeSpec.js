/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

const api = require('../../../src/js/get-api-data')
const locationSelector = require('../../../src/js/location/locationSelector')
const Model = require('../../../src/js/models/give-help/requests/listing')

describe('Needs Listing - no postcode set', () => {
  let ajaxGetStub,
    sut

  beforeEach(() => {
    ajaxGetStub = sinon.stub(api, 'data')
    sinon.stub(locationSelector, 'getPreviouslySetPostcode')
      .returns({
        then: function (success) {
          success(null)
        }
      })

    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    locationSelector.getPreviouslySetPostcode.restore()
  })

  it('- should ask user for postcode', () => {
    expect(sut.hasPostcode()).toBeFalsy()
  })

  it('- should not attempt to load needs', () => {
    expect(ajaxGetStub.called).toBeFalsy()
  })
})
