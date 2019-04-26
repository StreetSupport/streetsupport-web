/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')

const ajax = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const endpoints = require('../../../src/js/api')
const listToDropdown = require('../../../src/js/list-to-dropdown')
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

describe('Find Help by Category - postcode and subcatid set in querystring', () => {
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
        pathname: '/find-help/support/'
      })
    browserPushHistoryStub = sinon.stub(browser, 'pushHistory')
    sinon.stub(browser, 'setOnHistoryPop')
    sinon.stub(listToDropdown, 'init')

    postcodeLookupStub = sinon.stub(postcodeLookup, 'getCoords')
    postcodeLookupStub
      .callsArgWith(1, newLocation) // success callback function

    const queryStringStub = sinon.stub(querystring, 'parameter')
    queryStringStub
      .withArgs('postcode')
      .returns(newLocation.postcode)
    queryStringStub
      .withArgs('subCatId')
      .returns('dependency')

    sinon.stub(storage, 'set')
    sinon.stub(storage, 'get').returns({})

    sut = new FindHelpByCategory()
  })

  afterEach(() => {
    ajax.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.location.restore()
    browser.pushHistory.restore()
    browser.setOnHistoryPop.restore()
    listToDropdown.init.restore()
    postcodeLookup.getCoords.restore()
    querystring.parameter.restore()
    storage.get.restore()
    storage.set.restore()
  })

  it('- should get lat long from postcode lookup', () => {
    expect(postcodeLookupStub.getCall(0).args[0]).toEqual(newLocation.postcode)
  })

  it('- should retrieve items from API', () => {
    expect(apiGetStub.getCall(0).args[0]).toEqual(endpoints.getFullUrl('/v2/service-categories/support/456.7/234.5?range=10000'))
  })

  it('- should filter items by subCatId', () => {
    const nonDependencyItems = sut.items().filter((i) => !i.subCategories.map((sc) => sc.id).includes('dependency'))
    expect(nonDependencyItems.length).toEqual(0)
  })

  it('- should not update url', () => {
    expect(browserPushHistoryStub.called).toBeFalsy()
  })
})
