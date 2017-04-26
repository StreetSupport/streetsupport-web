/* global describe, beforeEach, afterEach, it, expect */

const ajaxGet = require('../../../src/js/get-api-data')
const sinon = require('sinon')
const Model = require('../../../src/js/models/accommodation/listing')
const endpoints = require('../../../src/js/api')
const browser = require('../../../src/js/browser')
const locationSelector = require('../../../src/js/location/locationSelector')

import { data } from './testdata'

describe('Accommodation - Listing', function () {
  let sut = null
  let browserLoadingStub = null
  let ajaxGetStub = null
  let browserLoadedStub = null

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
    sinon.stub(locationSelector, 'getCurrent')
      .returns({
        then: function (success, error) {
          success({
            latitude: 123.4,
            longitude: 567.8
          })
        }
      })

    sut = new Model()
  })

  afterEach(() => {
    ajaxGet.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    locationSelector.getCurrent.restore()
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

  it('- should map items to collection', () => {
    expect(sut.items().length).toEqual(4)
  })

  it('- should map id', () => {
    expect(sut.items()[0].id()).toEqual(data.items[0].id)
  })

  it('- should map name', () => {
    expect(sut.items()[0].name()).toEqual(data.items[0].name)
  })

  it('- should format address', () => {
    expect(sut.items()[0].address()).toEqual('street line 1, street line 2, manchester. m15 4qx')
  })

  it('- should map additionalInfo', () => {
    expect(sut.items()[0].additionalInfo()).toEqual(data.items[0].additionalInfo)
  })

  it('- should map is open access', () => {
    expect(sut.items()[0].isOpenAccess()).toEqual(data.items[0].isOpenAccess)
  })

  it('- should map type', () => {
    expect(sut.items()[0].accommodationType()).toEqual(data.items[0].accommodationType)
  })

  it('- should notify user is loaded', () => {
    expect(browserLoadedStub.calledAfter(ajaxGetStub)).toBeTruthy()
  })

  it('- should set details url', () => {
    expect(sut.items()[0].detailsUrl()).toEqual(`details?id=${data.items[0].id}`)
  })
})
