/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'
import ko from 'knockout'

const endpoints = require('../../../src/js/api')
const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const guides = require('./guides.json')
const querystring = require('../../../src/js/get-url-parameter')
delete require.cache[require.resolve('../../../src/js/pages/families/search-families-advice/search-families-advice')]
const SearchFamiliesAdviceModule = require('../../../src/js/pages/families/search-families-advice/search-families-advice')
sinon.stub(SearchFamiliesAdviceModule, 'SearchFamiliesAdvice').returns({
  advice: ko.observableArray([])
})

const Model = require('../../../src/js/models/families/families-guides')

describe('Init families landing page', () => {
  let ajaxGetStub,
    queryStringStub,
    sut

  beforeEach(() => {
    ajaxGetStub = sinon.stub(api, 'data')

    ajaxGetStub
      .onCall(0)
      .returns({
        then: function (success) {
          success({ data: guides })
        }
      })

    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'redirect')

    queryStringStub = sinon.stub(querystring, 'parameter')
    queryStringStub
      .withArgs('id')
      .returns('5f897e260532b831b083072c')

    sinon.stub(browser, 'pushHistory')
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

  it('- should retrieve guides from API', () => {
    expect(ajaxGetStub.getCall(0).args[0]).toEqual(endpoints.getFullUrl('/v1/content-pages?tags=families&type=guides&pageSize=100000&index=0'))
  })

  it('- should have guides', () => {
    expect(sut.hasGuides()).toEqual(true)
  })

  it('- should return guides', () => {
    expect(sut.guides().length).toEqual(3)
  })

  it('- should set guide id from query string', () => {
    expect(sut.guideIdInQuerystring()).toEqual('5f897e260532b831b083072c')
  })

  describe('- expand current guide', () => {
    let id

    beforeEach(() => {
      id = sut.guides().filter(x => x.id() === '5f897e260532b831b083072c')[0].id()
      sut.guides().filter(x => x.id() === id)[0].expand()
    })

    it('- should expand guide', () => {
      expect(sut.guides().filter(x => x.id() === id)[0].isExpanded()).toEqual(true)
    })

    describe('- select another guide', () => {
        let guide

        beforeEach(() => {
            guide = sut.guides()[0]
            guide.toggle()
            guide.expand()
        })
    
        it('- guides except current should be hided', () => {
            expect(sut.guides().filter(x => x.id() !== sut.guides()[0].id()).forEach(y => expect(y.isSelected()).toEqual(false)))
        })

        it('- guide should be selected', () => {
            expect(guide.isSelected()).toEqual(true)
        })

        it('- guide should be expanded', () => {
            expect(guide.isExpanded()).toEqual(true)
        })

        describe('- hide current guide', () => {
            beforeEach(() => {
                guide.toggle()
            })
        
            it('- guide should not be expaned', () => {
                expect(guide.isExpanded()).toEqual(false)
            })
    
            it('- should hide guide', () => {
              expect(guide.isSelected()).toEqual(false)
            })
        })
    })
  })
})
