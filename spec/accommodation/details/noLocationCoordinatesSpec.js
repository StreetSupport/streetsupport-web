/* global describe, beforeEach, afterEach, it, expect */

const ajaxGet = require('../../../src/js/get-api-data')
const sinon = require('sinon')
const Model = require('../../../src/js/models/accommodation/details')
const endpoints = require('../../../src/js/api')
const browser = require('../../../src/js/browser')
const locationSelector = require('../../../src/js/location/locationSelector')
const querystring = require('../../../src/js/get-url-parameter')

import * as storage from '../../../src/js/storage'

import { data } from './testdataNoLocationCoordinates'

describe('Accommodation - Listing', function () {
  let sut = null
  let ajaxGetStub = null
  let browserLoadingStub = null
  let browserLoadedStub = null
  let storageSetStub = null

  beforeEach(() => {
    ajaxGetStub = sinon.stub(ajaxGet, 'data')
      .returns({
        then: function (success, error) {
          success({
            'status': 'ok',
            'statusCode': 200,
            'data': data
          })
        }
      })
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    sinon.stub(querystring, 'parameter')
    sinon.stub(locationSelector, 'getPreviouslySetPostcode')
      .returns({
        then: function (success, error) {
          success({
            latitude: 123.4,
            longitude: 567.8,
            postcode: 'postcode'
          })
        }
      })
    sinon.stub(storage, 'get')
    storageSetStub = sinon.stub(storage, 'set')
    let fakeMapCallback = function(centre){}
    sut = new Model(fakeMapCallback)
    sut.build()
  })

  afterEach(() => {
    ajaxGet.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    locationSelector.getPreviouslySetPostcode.restore()
    querystring.parameter.restore()
    storage.get.restore()
    storage.set.restore()
  })

  it('- should not show the map', () => {
    expect(sut.viewModel.showMap).toBeFalsy()
  })
})
