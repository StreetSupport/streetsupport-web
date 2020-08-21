/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')

const ajax = require('../../../../src/js/get-api-data')
const browser = require('../../../../src/js/browser')
const endpoints = require('../../../../src/js/api')
const postcodeLookup = require('../../../../src/js/location/postcodes')
const querystring = require('../../../../src/js/get-url-parameter')
const storage = require('../../../../src/js/storage')

import FindHelpByClientGroup from '../../../../src/js/models/find-help/by-client-group/by-category'
import data from './supportServiceData'

const newLocation = {
  latitude: 456.7,
  longitude: 234.5,
  postcode: 'a new postcode'
}

describe('Find Help by Client Group - postcode and client group key set in querystring', () => {
  let sut,
    apiGetStub,
    browserPushHistoryStub,
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

    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'location')
      .returns({
        pathname: '/find-help/by-client-group/'
      })
    browserPushHistoryStub = sinon.stub(browser, 'pushHistory')
    sinon.stub(browser, 'setOnHistoryPop')

    postcodeLookupStub = sinon.stub(postcodeLookup, 'getCoords')
    postcodeLookupStub
      .callsArgWith(1, newLocation) // success callback function

    const queryStringStub = sinon.stub(querystring, 'parameter')

    queryStringStub
    .withArgs('postcode')
    .returns(newLocation.postcode)

    queryStringStub
    .withArgs('key')
    .returns('families')

    sinon.stub(storage, 'set')
    sinon.stub(storage, 'get').returns({})
    sut = new FindHelpByClientGroup(5)
  })

  afterEach(() => {
    ajax.data.restore()
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

  it('- should get lat long from postcode lookup', () => {
    expect(postcodeLookupStub.getCall(0).args[0]).toEqual(newLocation.postcode)
  })

  it('- should retrieve items from API', () => {
    expect(apiGetStub.getCall(0).args[0]).toEqual(endpoints.getFullUrl('/v2/service-categories/456.7/234.5?range=10000&pageSize=5&index=0&clientGroup=families'))
  })

  it('- should not update url', () => {
    expect(browserPushHistoryStub.called).toBeFalsy()
  })

  it('- should show load more button', () => {
    expect(sut.hasMorePages()).toBeTruthy()
  })

  it('- should be pageIndex equals to 0', () => {
    expect(sut.pageIndex()).toEqual(0)
  })

  describe('- click load more', () => {
    beforeEach(() => {
      sut.loadMore()
    })

    it('- should not show load more button', () => {
      expect(sut.hasMorePages()).toBeFalsy()
    })

    it('- should be pageIndex equals to 5', () => {
      expect(sut.pageIndex()).toEqual(5)
    })
  })
})