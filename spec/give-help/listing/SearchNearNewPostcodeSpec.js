/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

import { parseQuery } from '../../support/url'

const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const endpoints = require('../../../src/js/api')
const locationSelector = require('../../../src/js/location/locationSelector')
const Model = require('../../../src/js/models/give-help/requests/listing')
const needsData = require('./needsData')
const postcodeLookup = require('../../../src/js/location/postcodes')

describe('Needs Listing - new postcode search', () => {
  let ajaxGetStub,
    browserLoadingStub,
    browserLoadedStub,
    setPostcodeStub,
    postcodeLookupStub,
    sut

  const previouslySetLocation = {
    latitude: 123.4,
    longitude: 567.8,
    postcode: 'postcode'
  }

  const newLocation = {
    latitude: 456.7,
    longitude: 234.5,
    postcode: 'a new postcode'
  }

  beforeEach(() => {
    ajaxGetStub = sinon.stub(api, 'data')
    ajaxGetStub
      .returns({
        then: function (success) {
          success({ data: needsData.page2 })
        }
      })
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    sinon.stub(locationSelector, 'getPreviouslySetPostcode')
      .returns({
        then: function (success) {
          success(previouslySetLocation)
        }
      })
    setPostcodeStub = sinon.stub(locationSelector, 'setPostcode')
    postcodeLookupStub = sinon.stub(postcodeLookup)
    postcodeLookupStub
      .getCoords
      .callsArgWith(1, newLocation) // success callback function

    sut = new Model()

    ajaxGetStub.reset()
    browserLoadingStub.reset()
    browserLoadedStub.reset()

    sut.postcode('new postcode')
    sut.range(5000)
    sut.search()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    locationSelector.getPreviouslySetPostcode.restore()
    locationSelector.setPostcode.restore()
    postcodeLookup.getByCoords.restore()
    postcodeLookup.getCoords.restore()
  })

  it('- should notify it is loading', () => {
    expect(browserLoadingStub.called).toBeTruthy()
  })

  it('- should lookup coords for postcode', () => {
    expect(postcodeLookupStub.getCoords.getCall(0).args[0]).toEqual('new postcode')
  })

  it('- should set entered postcode as active postcode', () => {
    expect(setPostcodeStub.withArgs('new postcode').calledOnce).toBeTruthy()
  })

  it('- should load needs...', () => {
    expect(ajaxGetStub.calledAfter(browserLoadingStub)).toBeTruthy()
  })

  it('... from needs endpoint', () => {
    const url = ajaxGetStub.getCall(0).args[0].split('?')[0]
    expect(url).toEqual(endpoints.needsHAL)
  })

  it('... near to postcode', () => {
    const qs = parseQuery(ajaxGetStub.getCall(0).args[0])
    expect(qs.latitude).toEqual(newLocation.latitude.toString())
    expect(qs.longitude).toEqual(newLocation.longitude.toString())
  })

  it('... up to the desired range', () => {
    const qs = parseQuery(ajaxGetStub.getCall(0).args[0])
    expect(qs.range).toEqual('5000')
  })

  it('... 21 items at a time', () => {
    const qs = parseQuery(ajaxGetStub.getCall(0).args[0])
    expect(qs.pageSize).toEqual('21')
  })

  it('- should show user there are needs', () => {
    expect(sut.hasNeeds()).toBeTruthy()
  })

  it('- should set needs', () => {
    expect(sut.needsToDisplay().length).toEqual(4)
  })

  it('- should notify it is loaded', () => {
    expect(browserLoadedStub.calledAfter(ajaxGetStub)).toBeTruthy()
  })
})
