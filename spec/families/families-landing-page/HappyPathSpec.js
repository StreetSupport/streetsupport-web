/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'
import ko from 'knockout'

const endpoints = require('../../../src/js/api')
const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const adviceListByParentScenario = require('../search-result/advice-list-by-parent-scenario.json')
const guides = require('./guides.json')
const parentScenariosList = require('../search-advice/parent-scenarios-list.json')
const querystring = require('../../../src/js/get-url-parameter')
delete require.cache[require.resolve('../../../src/js/pages/families/search-families-advice/search-families-advice')]
const SearchFamiliesAdviceModule = require('../../../src/js/pages/families/search-families-advice/search-families-advice')
sinon.stub(SearchFamiliesAdviceModule, 'SearchFamiliesAdvice').returns({
  advice: ko.observableArray([])
})

const Model = require('../../../src/js/models/families/families')

describe('Init families landing page', () => {
  let ajaxGetStub,
    queryStringStub,
    browserPushHistoryStub,
    sut

  beforeEach(() => {
    ajaxGetStub = sinon.stub(api, 'data')

    ajaxGetStub
      .onCall(0)
      .returns({
        then: function (success) {
          success({ data: parentScenariosList })
        }
      })

    ajaxGetStub
    .onCall(1)
    .returns({
      then: function (success) {
        success({ data: guides })
      }
    })

    ajaxGetStub
    .onCall(2)
    .returns({
      then: function (success) {
        success({ data: adviceListByParentScenario })
      }
    })

    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'redirect')

    queryStringStub = sinon.stub(querystring, 'parameter')

    browserPushHistoryStub = sinon.stub(browser, 'pushHistory')
    sinon.stub(browser, 'setOnHistoryPop')

    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.redirect.restore()
    queryStringStub.restore() 
    browser.pushHistory.restore()
    browser.setOnHistoryPop.restore()
  })

  
  it('- should retrieve parent scenarios from API', () => {
    expect(ajaxGetStub.getCall(0).args[0]).toEqual(endpoints.getFullUrl('/v1/parent-scenarios?tags=families'))
  })

  it('- should retrieve guides from API', () => {
    expect(ajaxGetStub.getCall(1).args[0]).toEqual(endpoints.getFullUrl('/v1/content-pages?tags=families&type=guides&pageSize=100000&index=0'))
  })

  it('- should have parent scenarios', () => {
    expect(sut.hasParentScenarios()).toEqual(true)
  })

  it('- should return parent scenarios', () => {
    expect(sut.parentScenarios().length).toEqual(3)
  })
  
  it('- should have guides', () => {
    expect(sut.hasGuides()).toEqual(true)
  })

  it('- should return guides', () => {
    expect(sut.guides().length).toEqual(3)
  })

  it('- should not set current parent scenario', () => {
    expect(sut.currentParentScenario()).toEqual(undefined)
  })

  describe('- select parent scenario in filter', () => {
    let id
    beforeEach(() => {
      id = sut.parentScenarios()[0].id()
      sut.parentScenarios()[0].changeParentScenarioOnSearchResult()
    })

    it('- should have advice', () => {
      expect(sut.hasAdvice()).toEqual(true)
    })
  
    it('- should return advice', () => {
      expect(sut.adviceByParentScenario().length).toEqual(2)
    })
  
    it('- should return child advice', () => {
      sut.adviceByParentScenario().forEach((e) => {
        expect(e.parentScenarioId()).toEqual(id)
      })
    })

    it('- should set advice id in querystring', () => {
        const expected = browserPushHistoryStub.withArgs({ parentScenarioId: '5f69bf51a27c1c3b84fe6447' }, '', `?parentScenarioId=5f69bf51a27c1c3b84fe6447`).calledOnce
        expect(expected).toBeTruthy()
    })

    it('- should retrieve advice from API', () => {
      expect(ajaxGetStub.getCall(2).args[0]).toEqual(endpoints.getFullUrl('/v1/content-pages?tags=families&type=advice&pageSize=100000&index=0&parentScenarioId=5f69bf51a27c1c3b84fe6447'))
    })
  })
})
