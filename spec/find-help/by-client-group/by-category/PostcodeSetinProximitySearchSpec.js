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

describe('Find Help by Client Group - postcode set in proximity search', () => {
  let sut,
    apiGetStub,
    browserLoadingStub,
    browserLoadedStub,
    browserPushHistoryStub,
    postcodeLookupStub,
    storageSetStub,
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
        pathname: '/find-help/by-client-group/'
      })
    browserPushHistoryStub = sinon.stub(browser, 'pushHistory')
    sinon.stub(browser, 'setOnHistoryPop')
    postcodeLookupStub = sinon.stub(postcodeLookup, 'getCoords')
    postcodeLookupStub
      .callsArgWith(1, newLocation) // success callback function

    queryStringStub = sinon.stub(querystring, 'parameter')

    queryStringStub
    .withArgs('key')
    .returns('families')

    storageSetStub = sinon.stub(storage, 'set')
    sinon.stub(storage, 'get').returns({})

    sut = new FindHelpByClientGroup()
    sut.proximitySearch.postcode(newLocation.postcode)
    sut.proximitySearch.search()
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

  it('- should show it is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
  })

  it('- should get lat long from postcode lookup', () => {
    expect(postcodeLookupStub.getCall(0).args[0]).toEqual(newLocation.postcode)
  })

  it('- should retrieve items from API', () => {
    expect(apiGetStub.getCall(0).args[0]).toEqual(endpoints.getFullUrl('/v2/service-categories/456.7/234.5?range=10000&pageSize=25&index=0&clientGroup=families'))
  })

  it('- should set tab links', () => {
    expect(sut.listingHref()).toEqual(`/find-help/by-client-group/?key=families&postcode=${sut.proximitySearch.postcode()}`)
    expect(sut.timetableHref()).toEqual(`/find-help/by-client-group/timetable/?key=families&postcode=${sut.proximitySearch.postcode()}`)
    expect(sut.mapHref()).toEqual(`/find-help/by-client-group/map/?key=families&postcode=${sut.proximitySearch.postcode()}`)
  })

  it('- should set hasItems to true', () => {
    expect(sut.hasItems()).toBeTruthy()
  })

  it('- should show it is loaded', () => {
    expect(browserLoadedStub.calledAfter(apiGetStub)).toBeTruthy()
  })

  it('- should set the postcode as the user location', () => {
    const storageCall = storageSetStub.getCall(0)
    expect(storageCall.args[0]).toEqual(storage.keys.userLocationState)
    expect(storageSetStub.getCall(0).args[1]).toEqual({ latitude: 456.7, longitude: 234.5, postcode: 'a new postcode' })
  })

  it('- should set postcode in querystring', () => {
    const expected = browserPushHistoryStub.withArgs({ key: 'families', postcode: newLocation.postcode }, '', `?key=families&postcode=${newLocation.postcode}`).calledOnce
    expect(expected).toBeTruthy()
  })

  describe('update postcode in proximity search', () => {
    var updatedPostcode = 'updated postcode'
    beforeEach(() => {
      sut.proximitySearch.postcode(updatedPostcode)
      sut.proximitySearch.search()
    })

    it('- should set updated tab links', () => {
      expect(sut.listingHref()).toEqual(`/find-help/by-client-group/?key=families&postcode=${updatedPostcode}`)
      expect(sut.timetableHref()).toEqual(`/find-help/by-client-group/timetable/?key=families&postcode=${updatedPostcode}`)
      expect(sut.mapHref()).toEqual(`/find-help/by-client-group/map/?key=families&postcode=${updatedPostcode}`)
    })
  })
})
