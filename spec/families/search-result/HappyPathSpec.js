/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'
import ko from 'knockout'

const endpoints = require('../../../src/js/api')
const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const adviceListByParentScenario = require('./advice-list-by-parent-scenario.json')
const faqs = require('../families-advice/faqs.json')
const parentScenariosList = require('../search-advice/parent-scenarios-list.json')
const querystring = require('../../../src/js/get-url-parameter')
delete require.cache[require.resolve('../../../src/js/pages/families/search-families-advice/search-families-advice')]
const SearchFamiliesAdviceModule = require('../../../src/js/pages/families/search-families-advice/search-families-advice')
sinon.stub(SearchFamiliesAdviceModule, 'SearchFamiliesAdvice').returns({
  advice: ko.observableArray([])
})

const Model = require('../../../src/js/models/families/families-advice-result')

describe('Get search results by search phrase', () => {
  let ajaxGetStub,
    queryStringStub,
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
          success({ data: faqs })
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

    queryStringStub = sinon.stub(querystring, 'parameter')
    queryStringStub
      .withArgs('searchQuery')
      .returns('test')

    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    queryStringStub.restore() 
  })

  
  it('- should retrieve items from API', () => {
    expect(ajaxGetStub.getCall(0).args[0]).toEqual(endpoints.getFullUrl('/v1/parent-scenarios?tags=families'))
  })

  it('- should retrieve items from API', () => {
    expect(ajaxGetStub.getCall(1).args[0]).toEqual(endpoints.getFullUrl('/v1/faqs/?tags=families&pageSize=100000&index=0'))
  })

  it('- should have parent scenarios', () => {
    expect(sut.hasParentScenarios()).toEqual(true)
  })

  it('- should return parent scenarios', () => {
    expect(sut.parentScenarios().length).toEqual(3)
  })
  
  it('- should have faqs', () => {
    expect(sut.hasFAQs()).toEqual(true)
  })

  it('- should return faqs', () => {
    expect(sut.faqs().length).toEqual(2)
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

    it('- should return child advice', () => {
      sut.adviceByParentScenario().forEach((e) => {
        expect(e.parentScenarioId()).toEqual(id)
      })
    })
  })
})
