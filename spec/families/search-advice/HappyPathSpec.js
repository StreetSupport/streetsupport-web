/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const Model = require('../../../src/js/pages/families/search-family-advice/search-family-advice')
const adviceList = require('./advice-list')
const querystring = require('../../../src/js/get-url-parameter')
const location = require('../../../src/js/location/locationSelector')

describe('Search Families Advice', () => {
  let ajaxGetStub,
    browserLoadingStub,
    browserLoadedStub,
    sut

  const currentLocation = {
    id: 'manchester'
  }

  beforeEach(() => {
    ajaxGetStub = sinon.stub(api, 'data')
    ajaxGetStub
      .returns({
        then: function (success) {
          success({ data: adviceList })
        }
      })
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    sinon.stub(location, 'getCurrentHubFromCookies')
      .returns(currentLocation)

    sinon.stub(querystring, 'parameter')

    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    location.getCurrentHubFromCookies.restore()
    querystring.parameter.restore()
  })

  it('- should return and set advice', () => {
    expect(sut.advice().length).toEqual(5)
  })

  describe('- search by empty search filed', () => {
    beforeEach(() => {
      sut.searchQuery('nothing')
    })

    it('- should not search by empty search filed', () => {
      expect(sut.filteredAdvice().length).toEqual(0)
    })
  })

  describe('- search by wrong word', () => {
    beforeEach(() => {
      sut.searchQuery('nothing')
    })

    it('- should not search by wrong word', () => {
      expect(sut.filteredAdvice().length).toEqual(0)
    })
  })

  describe('- search in title', () => {
    beforeEach(() => {
      sut.searchQuery('title')
    })

    it('- should search in title', () => {
      expect(sut.filteredAdvice().length).toEqual(1)
    })
  })

  describe('- search in parent scenario', () => {
    beforeEach(() => {
      sut.searchQuery('ParentScenario3')
    })

    // it('- should search in parent scenario', () => {
    //   expect(sut.filteredAdvice().length).toEqual(1)
    // })
  })

  describe('- search in tag', () => {
    beforeEach(() => {
      sut.searchQuery('tag')
    })

    it('- should search in tag', () => {
      expect(sut.filteredAdvice().length).toEqual(3)
    })
  })

  describe('- search in body', () => {
    beforeEach(() => {
      sut.searchQuery('content')
    })

    it('- should search in body', () => {
      expect(sut.filteredAdvice().length).toEqual(1)
    })
  })

  describe('- search in title, tag, body', () => {
    beforeEach(() => {
      sut.searchQuery('common')
    })

    it('- should search in title, tag, body', () => {
      expect(sut.filteredAdvice().length).toEqual(3)
    })
  })
})