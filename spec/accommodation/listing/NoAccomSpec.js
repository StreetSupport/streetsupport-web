/* global describe, beforeEach, afterEach, it, expect */

const ajaxGet = require('../../../src/js/get-api-data')
const sinon = require('sinon')
const Model = require('../../../src/js/models/accommodation/listing')
const browser = require('../../../src/js/browser')
const querystring = require('../../../src/js/get-url-parameter')
const locationSelector = require('../../../src/js/location/locationSelector')

import * as storage from '../../../src/js/storage'

describe('Accommodation - Listing - No Accom', function () {
  let sut = null

  beforeEach(() => {
    sinon.stub(ajaxGet, 'data')
      .returns({
        then: function (success, error) {
          success({
            'status': 'ok',
            'statusCode': 200,
            'data': noItemsReturned
          })
        }
      })
    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'pushHistory')
    sinon.stub(querystring, 'parameter')
    sinon.stub(locationSelector, 'getPreviouslySetPostcode')
      .returns({
        then: function (success, error) {
          success({
            latitude: 123.4,
            longitude: 567.8
          })
        }
      })

    sinon.stub(storage, 'get')
    sinon.stub(storage, 'set')

    sut = new Model()
  })

  afterEach(() => {
    ajaxGet.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.pushHistory.restore()
    querystring.parameter.restore()
    locationSelector.getPreviouslySetPostcode.restore()
    storage.get.restore()
    storage.set.restore()
  })

  it('- should set noItemsAvailable to true', () => {
    expect(sut.noItemsAvailable()).toBeTruthy()
  })
})

const noItemsReturned = {
  'links': {
    'next': null,
    'prev': null,
    'self': '/v1/accommodation?index=0'
  },
  'items': [],
  'total': 0
}
