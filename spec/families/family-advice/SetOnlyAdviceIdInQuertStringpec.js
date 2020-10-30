/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

const endpoints = require('../../../src/js/api')
const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const adviceList = require('../search-advice/advice-list.json')
const faqs = require('./faqs')
const parentScenariosList = require('../search-advice/parent-scenarios-list.json')
const querystring = require('../../../src/js/get-url-parameter')
const proxyquire = require('proxyquire')
const SearchFamilyAdvice = sinon.stub();
const Model = proxyquire('../../../src/js/models/families/family-advice', {
    '../../pages/families/search-family-advice/search-family-advice': SearchFamilyAdvice
})

describe('Get Family Advice by advice id', () => {
  let ajaxGetStub,
    browserPushHistoryStub,
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
          success({ data: adviceList })
        }
      })

      ajaxGetStub
      .onCall(3)
      .returns({
        then: function (success) {
          success({ data: adviceList })
        }
      })

      ajaxGetStub
      .onCall(4)
      .returns({
        then: function (success) {
          success({ data: faqs })
        }
      })

    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')

    queryStringStub = sinon.stub(querystring, 'parameter')
    queryStringStub
      .withArgs('id')
      .returns('5f6b28d3a27c1d88789591cf')

      browserPushHistoryStub = sinon.stub(browser, 'pushHistory')
      sinon.stub(browser, 'setOnHistoryPop')
      
    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    queryStringStub.restore()   
    browser.pushHistory.restore()
    browser.setOnHistoryPop.restore()
  })

  it('- should not have parent scenario id in query string', () => {
    expect(sut.parentScenarioIdInQuerystring()).toEqual('')
  })

  it('- should have advice id in query string', () => {
    expect(sut.adviceIdInQuerystring()).toEqual('5f6b28d3a27c1d88789591cf')
  })

  it('- should retrieve items from API', () => {
    expect(ajaxGetStub.getCall(2).args[0]).toEqual(endpoints.getFullUrl('/v1/content-pages?tags=families&type=advice&pageSize=100000&index=0'))
  })

  it('- should return and set advice', () => {
    expect(sut.currentAdvice().id()).toEqual('5f6b28d3a27c1d88789591cf')
  })

  it('- should not return and set current parent scenario', () => {
    expect(sut.currentParentScenario()).toEqual(undefined)
  })

  it('- should have advice list', () => {
    expect(sut.hasAdvice()).toEqual(false)
  })

  it('- should return advice by parent scenario', () => {
    expect(sut.adviceByParentScenario().length).toEqual(0)
  })

  it('- should have parent scenarios', () => {
    expect(sut.hasParentScenarios()).toEqual(false)
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

  describe('- select another parent scenario in filter', () => {
    let id
    beforeEach(() => {
        id = sut.parentScenarios().filter(x => x.id() != sut.parentScenarioIdInQuerystring())[0].id()
        sut.parentScenarios().filter(x => x.id() != sut.parentScenarioIdInQuerystring())[0].changeParentScenario()
    })

    it('- should set id in query string', () => {
      expect(sut.parentScenarioIdInQuerystring()).toEqual(id)
    })

    it('- should set empty id in query string', () => {
        expect(sut.adviceIdInQuerystring()).toEqual('')
      })

    it('- should change current advice', () => {
        expect(sut.currentAdvice().id()).toEqual(id)
    })

    it('- should return and set current parent scenario', () => {
        expect(sut.currentParentScenario().id()).toEqual(id)
    })

    it('- should set parent scenario id in querystring', () => {
        const expected = browserPushHistoryStub.withArgs({ parentScenarioId: id, id: '' }, '', `?parentScenarioId=${id}&id=`).calledOnce
        expect(expected).toBeTruthy()
    })

    describe('- select another advice in filter', () => {
      let id
      beforeEach(() => {
          id = sut.adviceByParentScenario().filter(x => x.id() != sut.adviceIdInQuerystring())[0].id()
          sut.adviceByParentScenario().filter(x => x.id() != sut.adviceIdInQuerystring())[0].changeAdvice()
      })

      it('- should set id in query string', () => {
        expect(sut.adviceIdInQuerystring()).toEqual(id)
      })

      it('- should change current advice', () => {
          expect(sut.currentAdvice().id()).toEqual(id)
      })

      it('- should set advice id in querystring', () => {
          const expected = browserPushHistoryStub.withArgs({ parentScenarioId: '5f69bf51a27c1c3b84fe6447', id: id }, '', `?parentScenarioId=5f69bf51a27c1c3b84fe6447&id=${id}`).calledOnce
          expect(expected).toBeTruthy()
      })
    })
  })
})
