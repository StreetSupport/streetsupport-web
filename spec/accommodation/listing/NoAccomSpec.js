/* global describe, beforeEach, afterEach, it, expect */

const ajaxGet = require('../../../src/js/get-api-data')
const sinon = require('sinon')
const Model = require('../../../src/js/models/accommodation/listing')
const browser = require('../../../src/js/browser')
const locationSelector = require('../../../src/js/location/locationSelector')
const gMaps = require('../../../src/js/models/accommodation/googleMaps')

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
    sinon.stub(locationSelector, 'getCurrent')
      .returns({
        then: function (success, error) {
          success({
            latitude: 123.4,
            longitude: 567.8
          })
        }
      })
    sinon.stub(gMaps, 'buildMap')
    sinon.stub(gMaps, 'buildMarker')
    sinon.stub(gMaps, 'buildInfoWindow')

    sut = new Model()
  })

  afterEach(() => {
    ajaxGet.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    locationSelector.getCurrent.restore()
    gMaps.buildMap.restore()
    gMaps.buildMarker.restore()
    gMaps.buildInfoWindow.restore()
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
