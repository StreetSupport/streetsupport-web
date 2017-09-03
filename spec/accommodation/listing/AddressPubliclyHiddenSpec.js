/* global describe, beforeEach, afterEach, it, expect */

const ajaxGet = require('../../../src/js/get-api-data')
const sinon = require('sinon')
const Model = require('../../../src/js/models/accommodation/listing')
const endpoints = require('../../../src/js/api')
const browser = require('../../../src/js/browser')
const locationSelector = require('../../../src/js/location/locationSelector')
const querystring = require('../../../src/js/get-url-parameter')

import * as storage from '../../../src/js/storage'

import { data } from './testdataAddressPubliclyHidden'

describe('Accommodation - Listing Address Publicly Hidden', function () {
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
    sut = new Model()
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

  it('- should notify user is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
  })

  it('- should get data from api', () => {
    const calledAsExpected = ajaxGetStub
      .withArgs(`${endpoints.accommodation}?latitude=123.4&longitude=567.8`)
      .calledAfter(browserLoadingStub)
    expect(calledAsExpected).toBeTruthy()
  })

  it('- should set location name to nearest postcode', () => {
    expect(sut.locationName()).toEqual('postcode')
  })

  it('- should store user location state', () => {
    const storageToBeCalledAsExpected = storageSetStub
      .withArgs(storage.keys.userLocationState, {
        'postcode': 'postcode',
        'latitude': 123.4,
        'longitude': 567.8
      })
      .calledOnce
    expect(storageToBeCalledAsExpected).toBeTruthy()
  })

  it('- should produce an empty address line', () => {
    expect(sut.items()[0].address()).toEqual('')
  })
})
