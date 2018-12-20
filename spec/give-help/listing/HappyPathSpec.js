/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

import { parseQuery } from '../../support/url'

const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const endpoints = require('../../../src/js/api')
const Model = require('../../../src/js/models/give-help/requests/listing')
const needsData = require('./needsData')
const proximityRanges = require('../../../src/js/location/proximityRanges')
const querystring = require('../../../src/js/get-url-parameter')
const storage = require('../../../src/js/storage')

describe('Needs Listing', () => {
  let ajaxGetStub,
    browserLoadingStub,
    browserLoadedStub,
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
          success({ data: needsData.page1 })
        }
      })
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'pushHistory')
    sinon.stub(browser, 'setOnHistoryPop')
    sinon.stub(browser, 'location')
      .returns({
        hash: ''
      })
    sinon.stub(querystring, 'parameter')
    sinon.stub(storage, 'get').returns(previouslySetLocation)
    sinon.stub(storage, 'set')

    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.pushHistory.restore()
    browser.setOnHistoryPop.restore()
    browser.location.restore()
    querystring.parameter.restore()
    storage.get.restore()
    storage.set.restore()
  })

  it('- should set postcode as that previously saved', () => {
    expect(sut.proximitySearch.postcode()).toEqual(previouslySetLocation.postcode)
  })

  it('- should default range to 10000m', () => {
    expect(sut.proximitySearch.range()).toEqual(10000)
  })

  it('- should set ranges', () => {
    expect(sut.proximitySearch.ranges()).toEqual(proximityRanges.ranges)
  })

  it('- should notify it is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
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
    expect(qs.latitude).toEqual(previouslySetLocation.latitude.toString())
    expect(qs.longitude).toEqual(previouslySetLocation.longitude.toString())
  })

  it('... up to the desired range', () => {
    const qs = parseQuery(ajaxGetStub.getCall(0).args[0])
    expect(qs.range).toEqual('10000')
  })

  it('... 21 items at a time', () => {
    const qs = parseQuery(ajaxGetStub.getCall(0).args[0])
    expect(qs.pageSize).toEqual('21')
  })

  it('- should show user there are needs', () => {
    expect(sut.hasNeeds()).toBeTruthy()
  })

  it('- should set needs', () => {
    expect(sut.needsToDisplay().length).toEqual(21)
  })

  it('- should notify user it has loaded', () => {
    expect(browserLoadedStub.calledAfter(ajaxGetStub)).toBeTruthy()
  })

  it('- should show user there are more items available', () => {
    expect(sut.isMoreToLoad()).toBeTruthy()
  })

  describe('- load more', () => {
    beforeEach(() => {
      ajaxGetStub.reset()

      ajaxGetStub
      .returns({
        then: function (success) {
          success({ data: needsData.page2 })
        }
      })

      browserLoadingStub.reset()
      browserLoadedStub.reset()
      sut.loadNextPage()
    })

    it('- should show user it is loading', () => {
      expect(browserLoadingStub.calledOnce).toBeTruthy()
    })

    it('- should load next page of needs', () => {
      const url = ajaxGetStub.getCall(0).args[0]
      expect(url).toEqual(endpoints.getFullUrl(needsData.page1.links.next))
    })

    it('- should append new page needs to existing needs', () => {
      expect(sut.needsToDisplay().length).toEqual(25)
    })
  })
})
