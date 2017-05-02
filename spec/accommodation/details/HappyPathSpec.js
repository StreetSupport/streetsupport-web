/* global describe, beforeEach, afterEach, it, expect */

const ajaxGet = require('../../../src/js/get-api-data')
const sinon = require('sinon')
const Model = require('../../../src/js/models/accommodation/details')
const gMaps = require('../../../src/js/models/accommodation/googleMaps')
const endpoints = require('../../../src/js/api')
const browser = require('../../../src/js/browser')
const querystring = require('../../../src/js/get-url-parameter')

import { data } from './testdata'

describe('Accommodation - Listing', function () {
  let sut = null
  let browserLoadingStub = null
  let ajaxGetStub = null
  let browserLoadedStub = null
  let gMapsBuildMapStub = null

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
    gMapsBuildMapStub = sinon.stub(gMaps, 'buildMap')
    sinon.stub(querystring, 'parameter')
      .withArgs('id')
      .returns(data.id)

    sut = new Model()
  })

  afterEach(() => {
    ajaxGet.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    gMaps.buildMap.restore()
    querystring.parameter.restore()
  })

  it('- should notify user is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
  })

  it('- should get data from api', () => {
    const calledAsExpected = ajaxGetStub
      .withArgs(`${endpoints.accommodation}/${data.id}`)
      .calledAfter(browserLoadingStub)
    expect(calledAsExpected).toBeTruthy()
  })

  it('- should notify user is loaded', () => {
    expect(browserLoadedStub.calledAfter(ajaxGetStub)).toBeTruthy()
  })

  it('- should map name', () => {
    expect(sut.model.name()).toEqual(data.generalInfo.name)
  })

  it('- should set data is loaded to true', () => {
    expect(sut.dataIsLoaded()).toBeTruthy()
  })
})
