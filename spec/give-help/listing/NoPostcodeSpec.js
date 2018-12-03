/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const locationSelector = require('../../../src/js/location/locationSelector')
const Model = require('../../../src/js/models/give-help/requests/listing')
const querystring = require('../../../src/js/get-url-parameter')
const storage = require('../../../src/js/storage')

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
    sinon.stub(browser, 'pushHistory')
    sinon.stub(browser, 'setOnHistoryPop')
    sinon.stub(querystring, 'parameter')
    sinon.stub(storage, 'get')

    sut = new Model()
  })

  afterEach(() => {
    browser.pushHistory.restore()
    browser.setOnHistoryPop.restore()
    api.data.restore()
    locationSelector.getPreviouslySetPostcode.restore()
    querystring.parameter.restore()
    storage.get.restore()
  })

  it('- should ask user for postcode', () => {
    expect(sut.hasPostcode()).toBeFalsy()
  })

  it('- should not attempt to load needs', () => {
    expect(ajaxGetStub.called).toBeFalsy()
  })
})
