/* global describe, beforeEach, afterEach, it, expect */

const ajaxGet = require('../../../src/js/get-api-data')
const sinon = require('sinon')
const Model = require('../../../src/js/models/accommodation/listing')
const endpoints = require('../../../src/js/api')
const browser = require('../../../src/js/browser')
const locationSelector = require('../../../src/js/location/locationSelector')
const querystring = require('../../../src/js/get-url-parameter')

import { categories } from '../../../src/data/generated/accom-categories'
import * as storage from '../../../src/js/storage'

import { data, dataPage2 } from './testdata'

describe('Accommodation - Listing', function () {
  let sut = null
  let ajaxGetStub = null
  let browserLoadingStub = null
  let browserLoadedStub = null

  beforeEach(() => {
    ajaxGetStub = sinon.stub(ajaxGet, 'data')
    ajaxGetStub
      .withArgs(`${endpoints.accommodation}?latitude=123.4&longitude=567.8`)
      .returns({
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
    sinon.stub(querystring, 'parameter')
    sinon.stub(locationSelector, 'getPreviouslySetPostcode')
      .returns({
        then: function (success, error) {
          success({
            latitude: 123.4,
            longitude: 567.8,
            postcode: 'postcode'
          })
        }
      })
    sinon.stub(storage, 'get')
    sinon.stub(storage, 'set')
    sut = new Model()
  })

  afterEach(() => {
    ajaxGet.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    locationSelector.getPreviouslySetPostcode.restore()
    querystring.parameter.restore()
    storage.get.restore()
    storage.set.restore()
  })

  it('- should notify user is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
  })

  it('- should get data from api', () => {
    const calledAsExpected = ajaxGetStub
      .withArgs(`${endpoints.accommodation}?latitude=123.4&longitude=567.8`)
      .calledAfter(browserLoadingStub)
    expect(calledAsExpected).toBeTruthy()
  })

  it('- should set location name to nearest postcode', () => {
    expect(sut.locationName()).toEqual('postcode')
  })

  it('- should set accommodation categories', () => {
    expect(sut.accomTypes().length).toEqual(categories.length)
  })

  it('- should set selected accommodation filter as empty', () => {
    expect(sut.selectedType()).toEqual('')
  })

  it('- should map items to collection', () => {
    expect(sut.items().length).toEqual(4)
  })

  it('- should map mapIndex as zero-base-indexed', () => {
    sut.items()
      .forEach((e, i) => {
        expect(e.mapIndex()).toEqual(i)
      })
  })

  it('- should map mapIndexToDisplay as one-base-indexed', () => {
    sut.items()
      .forEach((e, i) => {
        expect(e.mapIndexToDisplay()).toEqual(i + 1)
      })
  })

  it('- should map id', () => {
    expect(sut.items()[0].id()).toEqual(data.items[0].id)
  })

  it('- should map latitude', () => {
    expect(sut.items()[0].latitude()).toEqual(data.items[0].latitude)
  })

  it('- should map longitude', () => {
    expect(sut.items()[0].longitude()).toEqual(data.items[0].longitude)
  })

  it('- should set as not active', () => {
    expect(sut.items()[0].isActive()).toBeFalsy()
  })

  it('- should map name', () => {
    expect(sut.items()[0].name()).toEqual(data.items[0].name)
  })

  it('- should format address', () => {
    expect(sut.items()[0].address()).toEqual('street line 1, street line 2, manchester. m15 4qx')
  })

  it('- should map additionalInfo', () => {
    expect(sut.items()[0].additionalInfo()).toEqual(data.items[0].additionalInfo)
  })

  it('- should map type', () => {
    expect(sut.items()[0].accommodationType()).toEqual(data.items[0].accommodationType)
  })

  it('- should notify user is loaded', () => {
    expect(browserLoadedStub.calledAfter(ajaxGetStub)).toBeTruthy()
  })

  it('- should set data is loaded to true', () => {
    expect(sut.dataIsLoaded()).toBeTruthy()
  })

  it('- should set details url', () => {
    expect(sut.items()[0].detailsUrl()).toEqual(`/find-help/accommodation/listing/details?id=${data.items[0].id}`)
  })

  describe('- item clicked', () => {
    beforeEach(() => {
      sut.items()[0].selectItem()
    })

    it('- should set is active', () => {
      expect(sut.items()[0].isActive()).toBeTruthy()
    })

    it('- should set other items as not active', () => {
      sut.items()
        .filter((i) => i.id !== sut.items()[0].id)
        .forEach((e) => {
          expect(e.isActive()).toBeFalsy()
        })
    })
  })

  describe('- more items available', () => {
    it('- should set nextPageEndpoint to true', () => {
      expect(sut.nextPageEndpoint()).toBeTruthy()
    })

    describe('- load more', () => {
      beforeEach(() => {
        ajaxGetStub
          .withArgs(endpoints.getFullUrl(data.links.next))
          .returns({
            then: function (success, error) {
              success({
                'status': 'ok',
                'statusCode': 200,
                'data': dataPage2
              })
            }
          })

        browserLoadingStub.reset()
        browserLoadedStub.reset()
        sut.loadNext()
      })

      it('- should notify user is loading', () => {
        expect(browserLoadingStub.calledOnce).toBeTruthy()
      })

      it('- should append new items to current list', () => {
        expect(sut.items().length).toEqual(data.items.length + dataPage2.items.length)
      })

      it('- should set data is loaded to true', () => {
        expect(sut.dataIsLoaded()).toBeTruthy()
      })
    })
  })
})
