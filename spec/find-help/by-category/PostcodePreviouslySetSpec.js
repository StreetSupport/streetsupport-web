/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')

const ajax = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const listToDropdown = require('../../../src/js/list-to-dropdown')
const endpoints = require('../../../src/js/api')
const postcodeLookup = require('../../../src/js/location/postcodes')
const querystring = require('../../../src/js/get-url-parameter')
const storage = require('../../../src/js/storage')

import FindHelpByCategory from '../../../src/js/models/find-help/by-category'
import data from './supportServiceData'

const newLocation = {
  latitude: 456.7,
  longitude: 234.5,
  postcode: 'a new postcode'
}

describe('Find Help by Category - postcode previously set', () => {
  let sut,
    apiGetStub,
    browserLoadingStub,
    browserLoadedStub,
    postcodeLookupStub

  beforeEach(() => {
    apiGetStub = sinon.stub(ajax, 'data')
    apiGetStub.returns({
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
    sinon.stub(browser, 'location')
      .returns({
        pathname: '/find-help/support/'
      })
    sinon.stub(browser, 'pushHistory')
    sinon.stub(browser, 'setOnHistoryPop')
    sinon.stub(listToDropdown, 'init')
    postcodeLookupStub = sinon.stub(postcodeLookup, 'getCoords')
    sinon.stub(querystring, 'parameter')
    sinon.stub(storage, 'set')
    sinon.stub(storage, 'get')
      .returns(newLocation)

    sut = new FindHelpByCategory()
  })

  afterEach(() => {
    ajax.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.pushHistory.restore()
    browser.setOnHistoryPop.restore()
    browser.location.restore()
    listToDropdown.init.restore()
    postcodeLookup.getCoords.restore()
    querystring.parameter.restore()
    storage.get.restore()
    storage.set.restore()
  })

  it('- should set postcode in proximity search', () => {
    expect(sut.proximitySearch.postcode()).toEqual(newLocation.postcode)
  })

  it('- should set latitude in proximity search', () => {
    expect(sut.proximitySearch.latitude).toEqual(newLocation.latitude)
  })

  it('- should set longitude in proximity search', () => {
    expect(sut.proximitySearch.longitude).toEqual(newLocation.longitude)
  })

  it('- should show it is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
  })

  it('- should be no postcode lookup', () => {
    expect(postcodeLookupStub.notCalled).toBeTruthy()
  })

  it('- should retrieve items from API', () => {
    expect(apiGetStub.getCall(0).args[0]).toEqual(endpoints.getFullUrl('/v2/service-categories/support/456.7/234.5?range=10000'))
  })

  it('- should show it is loaded', () => {
    expect(browserLoadedStub.calledAfter(apiGetStub)).toBeTruthy()
  })
})
