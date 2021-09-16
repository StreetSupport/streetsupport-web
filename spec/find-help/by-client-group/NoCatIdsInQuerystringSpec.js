/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')
const ajax = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
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
        pathname: '/find-help/group/families/'
      })
    browserPushHistoryStub = sinon.stub(browser, 'pushHistory')
    sinon.stub(utils, 'isSmallscreen').returns(false)
    sinon.stub(listToDropdown, 'init')
    sinon.stub(browser, 'setOnHistoryPop')
    postcodeLookupStub = sinon.stub(postcodeLookup, 'getCoords')
    postcodeLookupStub
      .callsArgWith(1, newLocation) // success callback function

    const queryStringStub = sinon.stub(querystring, 'parameter')

    queryStringStub
    .withArgs('postcode')
    .returns(newLocation.postcode)

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
    utils.isSmallscreen.restore()
    listToDropdown.init.restore()
    browser.setOnHistoryPop.restore()
    postcodeLookup.getCoords.restore()
    querystring.parameter.restore()
    storage.get.restore()
    storage.set.restore()
  })

  it('- should get lat long from postcode lookup', () => {
    expect(postcodeLookupStub.getCall(0).args[0]).toEqual(newLocation.postcode)
  })

  it('- should be selected all categories and subcategories', () => {
    for (let i = 0; i < sut.catFilters().length; i++) {
        expect(sut.catFilters()[i].isSelected()).toBeTruthy()
        for (let j = 0; j < sut.catFilters()[i].subCategories().length - 1; j++) {
          expect(sut.catFilters()[i].subCategories()[j].isSelected()).toBeTruthy()
        }
    }
  })
  
  it('- should clear the last category and its subcategories', () => {
    for (let i = 0; i < sut.catFilters().length; i++) {
      if (i == sut.catFilters().length - 1) {
        sut.catFilters()[i].filter()
        expect(sut.catFilters()[i].isSelected()).toBeFalsy()
        for (let j = 0; j < sut.catFilters()[i].subCategories().length - 1; j++) {
          expect(sut.catFilters()[i].subCategories()[j].isSelected()).toBeFalsy()
        }
        continue;
      }
      expect(sut.catFilters()[i].isSelected()).toBeTruthy()
      for (let j = 0; j < sut.catFilters()[i].subCategories().length - 1; j++) {
        expect(sut.catFilters()[i].subCategories()[j].isSelected()).toBeTruthy()
      }
    }
  })

  it('- should clear and then select all categories and its subcategories', () => {
    for (let i = 0; i < sut.catFilters().length; i++) {
      if (i == 0) {
        sut.catFilters()[i].filter()
      }
      expect(sut.catFilters()[i].isSelected()).toBeFalsy()
      for (let j = 0; j < sut.catFilters()[i].subCategories().length - 1; j++) {
        expect(sut.catFilters()[i].subCategories()[j].isSelected()).toBeFalsy()
      }
    }

    for (let i = 0; i < sut.catFilters().length; i++) {
      if (i == 0) {
        sut.catFilters()[i].filter()
      }
      expect(sut.catFilters()[i].isSelected()).toBeTruthy()
      for (let j = 0; j < sut.catFilters()[i].subCategories().length - 1; j++) {
        expect(sut.catFilters()[i].subCategories()[j].isSelected()).toBeTruthy()
      }
    }
  })
})
