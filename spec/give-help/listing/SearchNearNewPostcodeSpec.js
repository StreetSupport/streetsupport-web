/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

import { parseQuery } from '../../support/url'

const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const endpoints = require('../../../src/js/api')
const Model = require('../../../src/js/models/give-help/requests/listing')
const needsData = require('./needsData')
const postcodeLookup = require('../../../src/js/location/postcodes')
const querystring = require('../../../src/js/get-url-parameter')
const storage = require('../../../src/js/storage')

describe('Needs Listing - new postcode search', () => {
  let ajaxGetStub,
    browserLoadingStub,
    browserLoadedStub,
    browserPushHistoryStub,
    storageSetStub,
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
    sinon.stub(browser, 'setOnHistoryPop')
    sinon.stub(browser, 'location')
      .returns({})
    browserPushHistoryStub = sinon.stub(browser, 'pushHistory')
    postcodeLookupStub = sinon.stub(postcodeLookup, 'getCoords')
    postcodeLookupStub
      .callsArgWith(1, newLocation) // success callback function
    sinon.stub(querystring, 'parameter')
    sinon.stub(storage, 'get').returns(previouslySetLocation)
    storageSetStub = sinon.stub(storage, 'set')

    sut = new Model()

    ajaxGetStub.reset()
    browserLoadingStub.reset()
    browserLoadedStub.reset()

    sut.proximitySearch.postcode(newLocation.postcode)
    sut.proximitySearch.range(5000)
    sut.proximitySearch.search()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.location.restore()
    browser.pushHistory.restore()
    browser.setOnHistoryPop.restore()
    postcodeLookup.getCoords.restore()
    querystring.parameter.restore()
    storage.get.restore()
    storage.set.restore()
  })

  it('- should notify it is loading', () => {
    expect(browserLoadingStub.called).toBeTruthy()
  })

  it('- should lookup coords for postcode', () => {
    expect(postcodeLookupStub.getCall(0).args[0]).toEqual(newLocation.postcode)
  })

  it('- should set entered postcode as active postcode', () => {
    expect(storageSetStub.calledOnce).toBeTruthy()
    expect(storageSetStub.getCalls()[0].args).toEqual([storage.keys.userLocationState, newLocation])
  })

  it('- should load needs...', () => {
    expect(ajaxGetStub.calledAfter(browserLoadingStub)).toBeTruthy()
  })

  it('... from needs endpoint', () => {
    const url = ajaxGetStub.getCall(0).args[0].split('?')[0]
    expect(url).toEqual(endpoints.needs)
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

  it('- should set postcode in querystring', () => {
    const payload = [
      { postcode: newLocation.postcode, type: 'All' },
      '',
      `?postcode=${newLocation.postcode}&type=All`
    ]
    expect(browserPushHistoryStub.getCalls()[1].args).toEqual(payload)
  })

  it('- should notify it is loaded', () => {
    expect(browserLoadedStub.calledAfter(ajaxGetStub)).toBeTruthy()
  })
})
