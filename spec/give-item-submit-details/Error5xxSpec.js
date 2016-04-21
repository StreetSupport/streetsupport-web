/* global describe, beforeEach, afterEach, it, expect */

var postToApi = require('../../src/js/post-api-data')
var getFromApi = require('../../src/js/get-api-data')
var sinon = require('sinon')
var Model = require('../../src/js/models/GiveItemModel')
var endpoints = require('../../src/js/api')
var getUrlParams = require('../../src/js/get-url-parameter')
var browser = require('../../src/js/browser')
var needData = require('./needData')

describe('Give Item Model', function () {
  var model
  var urlParamStub
  var browserRedirectStub
  var needId = needData.data.needId
  var postToApiStub

  describe('API returns 5xx error', function () {
    beforeEach(function () {
      urlParamStub = sinon.stub(getUrlParams, 'parameter')
      urlParamStub.withArgs('id')
        .returns(needId)
      sinon.stub(getFromApi, 'data')
        .withArgs(endpoints.needs + needId)
        .returns({
          then: function (success, error) {
            success({
              'status': 'ok',
              'data': needData.data
            })
          }
        })

      postToApiStub = sinon.stub(postToApi, 'post')
      postToApiStub.returns({
        then: function (success, error) {
          error(new Error('borked'))
        }
      })

      sinon.stub(browser, 'loading')
      sinon.stub(browser, 'loaded')
      sinon.stub(browser, 'trackEvent')
      browserRedirectStub = sinon.stub(browser, 'redirect')

      model = new Model()

      model.formModel().email('test@test.com')
      model.formModel().message('message')
      model.formModel().isOptedIn(true)

      model.submit()
    })

    afterEach(function () {
      getFromApi.data.restore()
      getUrlParams.parameter.restore()
      browser.loading.restore()
      browser.loaded.restore()
      browser.redirect.restore()
      browser.trackEvent.restore()
      postToApi.post.restore()
    })

    it('should redirect to 500 page', function () {
      expect(browserRedirectStub.withArgs('/500/').calledOnce).toBeTruthy()
    })
  })
})
