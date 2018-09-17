/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const locationSelector = require('../../../src/js/location/locationSelector')
const Model = require('../../../src/js/models/give-help/requests/listing')

describe('Needs Listing', () => {
  let ajaxGetStub,
    sut

  const previouslySetLocation = {
    latitude: 123.4,
    longitude: 567.8,
    postcode: 'postcode'
  }

  beforeEach(() => {
    ajaxGetStub = sinon.stub(api, 'data')
    ajaxGetStub
      .returns({
        then: function (success) {
          success({
            data: {
              links: {},
              items: []
            }
          })
        }
      })
    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'location')
      .returns({
        hash: ''
      })
    sinon.stub(locationSelector, 'getPreviouslySetPostcode')
      .returns({
        then: function (success) {
          success(previouslySetLocation)
        }
      })

    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    locationSelector.getPreviouslySetPostcode.restore()
  })

  it('- should show user there are no needs', () => {
    expect(sut.hasNeeds()).toBeFalsy()
  })
})
