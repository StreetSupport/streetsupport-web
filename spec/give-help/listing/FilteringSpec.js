/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const Model = require('../../../src/js/models/give-help/requests/listing')
const needsData = require('./needsData')
const querystring = require('../../../src/js/get-url-parameter')
const storage = require('../../../src/js/storage')

describe('Needs Listing - filtering', () => {
  let ajaxGetStub,
    browserHistoryStub,
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
    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'setOnHistoryPop')
    sinon.stub(browser, 'location')
      .returns({
        hash: '',
        pathname: '/give-help/help/'
      })
    browserHistoryStub = sinon.stub(browser, 'pushHistory')

    sinon.stub(querystring, 'parameter')
    sinon.stub(storage, 'get').returns(previouslySetLocation)
    sinon.stub(storage, 'set')

    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.pushHistory.restore()
    browser.setOnHistoryPop.restore()
    browser.location.restore()
    querystring.parameter.restore()
    storage.get.restore()
    storage.set.restore()
  })

  describe('- for items', () => {
    beforeEach(() => {
      sut.filterForItems()
    })

    it('- should only display items', () => {
      expect(sut.needsToDisplay().filter((n) => n.type() !== 'items').length).toEqual(0)
    })

    it('- should set active filter to items', () => {
      const inActiveFilters = sut.filters()
        .filter((n) => n.isActive() === false)
        .map((f) => f.label)
      expect(inActiveFilters.includes('Items')).toBeFalsy()
    })

    it('- should push history', () => {
      expect(browserHistoryStub.getCall(1).args[2]).toEqual('?postcode=postcode&type=Items')
    })
  })

  describe('- for time', () => {
    beforeEach(() => {
      sut.filterForTime()
    })

    it('- should only display time', () => {
      expect(sut.needsToDisplay().filter((n) => n.type() !== 'time').length).toEqual(0)
    })

    it('- should set active filter to time', () => {
      const inActiveFilters = sut.filters()
        .filter((n) => n.isActive() === false)
        .map((f) => f.label)
      expect(inActiveFilters.includes('Time')).toBeFalsy()
    })
  })

  describe('- for money', () => {
    beforeEach(() => {
      sut.filterForMoney()
    })

    it('- should only display money', () => {
      expect(sut.needsToDisplay().filter((n) => n.type() !== 'money').length).toEqual(0)
    })

    it('- should set active filter to items', () => {
      const inActiveFilters = sut.filters()
        .filter((n) => n.isActive() === false)
        .map((f) => f.label)
      expect(inActiveFilters.includes('Money')).toBeFalsy()
    })
  })

  describe('- for all', () => {
    beforeEach(() => {
      sut.clearFilter()
    })

    it('- shoulddisplay all', () => {
      expect(sut.needsToDisplay().length).toEqual(21)
    })

    it('- should set active filter to items', () => {
      const inActiveFilters = sut.filters()
        .filter((n) => n.isActive() === false)
        .map((f) => f.label)
      expect(inActiveFilters.includes('All')).toBeFalsy()
    })
  })
})
