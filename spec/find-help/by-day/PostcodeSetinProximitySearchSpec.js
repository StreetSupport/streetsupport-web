/* global describe, beforeAll, afterAll, it, expect */

const sinon = require('sinon')

const ajax = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const endpoints = require('../../../src/js/api')
const postcodeLookup = require('../../../src/js/location/postcodes')
const querystring = require('../../../src/js/get-url-parameter')
const storage = require('../../../src/js/storage')

import FindHelpByCategory from '../../../src/js/models/find-help/by-day'
import data from './supportServiceData'

const newLocation = {
  latitude: 456.7,
  longitude: 234.5,
  postcode: 'a new postcode'
}

describe('Find Help by Day - postcode set in proximity search', () => {
  let sut,
    apiGetStub,
    browserLoadingStub,
    browserLoadedStub,
    browserPushHistoryStub,
    postcodeLookupStub,
    storageSetStub

  beforeAll(() => {
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
    browserPushHistoryStub = sinon.stub(browser, 'pushHistory')
    sinon.stub(browser, 'setOnHistoryPop')

    postcodeLookupStub = sinon.stub(postcodeLookup, 'getCoords')
    postcodeLookupStub
      .callsArgWith(1, newLocation) // success callback function

    sinon.stub(querystring, 'parameter')

    storageSetStub = sinon.stub(storage, 'set')
    sinon.stub(storage, 'get').returns({})

    sut = new FindHelpByCategory()
    sut.proximitySearch.postcode(newLocation.postcode)
    sut.proximitySearch.search()
  })

  afterAll(() => {
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
    expect(apiGetStub.getCall(0).args[0]).toEqual(endpoints.getFullUrl('/v2/timetabled-service-providers/show/support/long/234.5/lat/456.7?range=10000'))
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
    const expected = browserPushHistoryStub.withArgs({ postcode: newLocation.postcode }, '', `?postcode=${newLocation.postcode}`).calledOnce
    expect(expected).toBeTruthy()
  })

  it('- should set first day as selected', () => {
    expect(sut.dayOfWeek()).toEqual(sut.items()[0].name)
  })

  describe('- open accordion', () => {
    const dayIndexToOpen = 3
    beforeAll(() => {
      sut.items()[dayIndexToOpen].isSelected(true)
    })

    it('- should close any open ones', () => {
      sut.items()
        .filter((d, i) => i !== dayIndexToOpen)
        .forEach((d) => {
          expect(d.isSelected()).toBeFalsy()
        })
    })
  })

  describe('- filtering by day', () => {
    const dayIndexToOpen = 3
    beforeAll(() => {
      sut.dayOfWeek(sut.items()[dayIndexToOpen].name)
    })

    it('- should open requested', () => {
      expect(sut.items()[dayIndexToOpen].isSelected()).toBeTruthy()
    })
  })

  describe('- filtering by time of day', () => {
    beforeAll(() => {
      sut.timeOfDay('Evening')
    })

    it('- should hide morning and afternoon services', () => {
      sut.items()
        .reduce((acc, next) => [...acc, ...next.serviceProviders], [])
        .forEach((sp) => {
          if (sp.openingTime.endTime <= '17:30') {
            expect(sp.isNotVisible()).toBeTruthy()
          } else {
            expect(sp.isNotVisible()).toBeFalsy()
          }
        })
    })
  })
})
