/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

import { parseQuery } from '../../support/url'

const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const endpoints = require('../../../src/js/api')
const locationSelector = require('../../../src/js/location/locationSelector')
const Model = require('../../../src/js/models/give-help/requests/listing')
const needsData = require('./needsData')
const proximityRanges = require('../../../src/js/location/proximityRanges')

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
    sinon.stub(browser, 'location')
      .returns({
        hash: ''
      })
    sinon.stub(locationSelector, 'getPreviouslySetPostcode')
      .returns({
        then: function (success) {
          success(previouslySetLocation)
        }
      })

    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.location.restore()
    locationSelector.getPreviouslySetPostcode.restore()
  })

  it('- should set postcode as that previously saved', () => {
    expect(sut.postcode()).toEqual(previouslySetLocation.postcode)
  })

  it('- should default range to 10000m', () => {
    expect(sut.range()).toEqual(10000)
  })

  it('- should set ranges', () => {
    expect(sut.ranges()).toEqual(proximityRanges.ranges)
  })

  it('- should notify it is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
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
