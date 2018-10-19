/* global describe, beforeEach, afterEach, it, expect */

const ajaxGet = require('../../../src/js/get-api-data')
const api = require('../../../src/js/api')
const sinon = require('sinon')
const Model = require('../../../src/js/models/accommodation/listing')
const browser = require('../../../src/js/browser')
const locationSelector = require('../../../src/js/location/locationSelector')
const querystring = require('../../../src/js/get-url-parameter')

import * as storage from '../../../src/js/storage'
import { data } from './testdata'

describe('Accommodation - Listing - Referral Filtering', function () {
  let sut = null
  let ajaxGetStub = null

  beforeEach(() => {
    ajaxGetStub = sinon.stub(ajaxGet, 'data')
      .returns({
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
    sinon.stub(browser, 'pushHistory')
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
      .returns({
        postcode: 'postcode',
        latitude: 123.4,
        longitude: 567.8
      })
    sinon.stub(storage, 'set')
    sut = new Model()
  })

  afterEach(() => {
    ajaxGet.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.pushHistory.restore()
    locationSelector.getPreviouslySetPostcode.restore()
    querystring.parameter.restore()
    storage.get.restore()
    storage.set.restore()
  })

  it('- should set up the referral dropdown to be unselected', () => {
    expect(sut.referralRequired()).toEqual()
  })

  describe('- filter on referrals', () => {
    beforeEach(() => {
      sut.referralRequired(true)
    })

    describe('- update', () => {
      beforeEach(() => {
        sut.updateListing()
      })

      it('- should update with new results', () => {
        const calledAsExpected = ajaxGetStub
          .withArgs(api.accommodation + '?latitude=123.4&longitude=567.8&referralRequired=true')
          .calledOnce
        expect(calledAsExpected).toBeTruthy()
      })

      it('- should replace old results', () => {
        expect(sut.items().length).toEqual(data.items.length)
      })
    })

    describe('- reset', () => {
      beforeEach(() => {
        sut.resetFilter()
      })

      it('- should set up the referral dropdown to be unselected', () => {
        expect(sut.referralRequired()).toEqual(undefined)
      })
    })
  })
})
