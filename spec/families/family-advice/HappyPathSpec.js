/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const advice = require('./advice')
const Model = require('../../../src/js/models/families/family-advice')
const querystring = require('../../../src/js/get-url-parameter')

describe('Get Family Advice', () => {
  let ajaxGetStub,
    browserLoadingStub,
    browserLoadedStub,
    queryStringStub,
    sut

  beforeEach(() => {
    ajaxGetStub = sinon.stub(api, 'data')
    ajaxGetStub
      .returns({
        then: function (success) {
          success({ data: advice })
        }
      })
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')

    queryStringStub = sinon.stub(querystring, 'parameter')
    queryStringStub
      .withArgs('id')
      .returns('5f6b28d3a27c1d88789591cf')

    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    queryStringStub.restore()
  })

  it('- should build breadcrumbs', () => {
    expect(sut.advice().breadcrumbs()).toEqual('Families > Parent scenario 1 > Family 1 common')
  })
})
