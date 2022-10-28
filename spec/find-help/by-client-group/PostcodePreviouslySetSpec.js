/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')
const ajax = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const endpoints = require('../../../src/js/api')
const postcodeLookup = require('../../../src/js/location/postcodes')
const querystring = require('../../../src/js/get-url-parameter')
const storage = require('../../../src/js/storage')
const listToDropdown = require('../../../src/js/list-to-dropdown')

import FindHelpByClientGroup from '../../../src/js/models/find-help/by-client-group/by-group'
import data from './supportServiceData'
import utils from '../../../src/js/utils'

const newLocation = {
  latitude: 456.7,
  longitude: 234.5,
  postcode: 'a new postcode'
}

describe('Find Help by Client Group - postcode previously set', () => {
  let sut,
    apiGetStub,
    browserLoadingStub,
    browserLoadedStub,
    postcodeLookupStub,
    queryStringStub

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
        pathname: '/find-help/group/families/'
      })
    sinon.stub(browser, 'pushHistory')
    sinon.stub(utils, 'isSmallscreen').returns(false)
    sinon.stub(listToDropdown, 'init')
    sinon.stub(browser, 'setOnHistoryPop')
    postcodeLookupStub = sinon.stub(postcodeLookup, 'getCoords')
    queryStringStub = sinon.stub(querystring, 'parameter')

    queryStringStub
      .withArgs('catIds')
      .returns('dropin')

    queryStringStub
      .withArgs('subCatIds')
      .returns('general')

    sinon.stub(storage, 'set')
    sinon.stub(storage, 'get')
      .returns(newLocation)

    sut = new FindHelpByClientGroup()
  })

  afterEach(() => {
    ajax.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.pushHistory.restore()
    utils.isSmallscreen.restore()
    listToDropdown.init.restore()
    browser.setOnHistoryPop.restore()
    browser.location.restore()
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
    expect(apiGetStub.getCall(0).args[0]).toEqual(endpoints.getFullUrl('/v2/service-categories/by-client-group?pageSize=25&latitude=456.7&longitude=234.5&range=10000&index=0&clientGroup=families&catIds=dropin&subCatIds=general'))
  })

  it('- should show it is loaded', () => {
    expect(browserLoadedStub.calledAfter(apiGetStub)).toBeTruthy()
  })
})
