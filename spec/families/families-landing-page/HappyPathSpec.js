/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'
import ko from 'knockout'

const endpoints = require('../../../src/js/api')
const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const guides = require('../families-guides/guides.json')
const parentScenariosList = require('../search-advice/parent-scenarios-list.json')
delete require.cache[require.resolve('../../../src/js/pages/families/search-families-advice/search-families-advice')]
const SearchFamiliesAdviceModule = require('../../../src/js/pages/families/search-families-advice/search-families-advice')
sinon.stub(SearchFamiliesAdviceModule, 'SearchFamiliesAdvice').returns({
  advice: ko.observableArray([])
})

const Model = require('../../../src/js/models/families/families')

describe('Init families landing page', () => {
  let ajaxGetStub,
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

    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'redirect')

    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.redirect.restore()
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
})
