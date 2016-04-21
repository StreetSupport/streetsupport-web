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
  var getFromApiStub
  var urlParamStub
  var browserLoadingStub
  var browserLoadedStub
  var browserTrackEventStub
  var needId = needData.data.needId

  describe('Happy Path', function () {
    beforeEach(function () {
      urlParamStub = sinon.stub(getUrlParams, 'parameter')
      urlParamStub.withArgs('id')
        .returns(needId)

      getFromApiStub = sinon.stub(getFromApi, 'data')
        .withArgs(endpoints.needs + needId)
        .returns({
          then: function (success, error) {
            success({
              'status': 'ok',
              'data': needData.data
            })
          }
        })

      browserLoadingStub = sinon.stub(browser, 'loading')
      browserLoadedStub = sinon.stub(browser, 'loaded')
      browserTrackEventStub = sinon.stub(browser, 'trackEvent')

      model = new Model()
    })

    afterEach(function () {
      getFromApi.data.restore()
      getUrlParams.parameter.restore()
      browser.loading.restore()
      browser.loaded.restore()
      browser.trackEvent.restore()
    })

    it('should get need data', function () {
      expect(getFromApiStub.calledOnce).toBeTruthy()
    })

    it('should set providerName', function () {
      expect(model.providerName()).toEqual('Albert Kennedy Trust')
    })

    it('should set needDescription', function () {
      expect(model.needDescription()).toEqual('need description')
    })

    it('should set needReason', function () {
      expect(model.needReason()).toEqual('reason')
    })

    it('should show user it is loading', function () {
      expect(browserLoadingStub.calledOnce).toBeTruthy()
    })

    it('should show user then that is loaded', function () {
      expect(browserLoadedStub.calledAfter(browserLoadingStub)).toBeTruthy()
    })

    describe('Submit', function () {
      var postToApiStub

      beforeEach(function () {
        postToApiStub = sinon.stub(postToApi, 'post')
        postToApiStub.returns({
          then: function (success, error) {
            success({
              'status': 'created',
              'statusCode': 201
            })
          }
        })

        browser.loading.reset()
        browser.loaded.reset()

        model.formModel().email('test@test.com')
        model.formModel().message('message')
        model.formModel().isOptedIn(true)

        model.submit()
      })

      afterEach(function () {
        postToApi.post.restore()
      })

      it('should post form to api', function () {
        expect(postToApiStub
          .withArgs(endpoints.needs + needId + '/offers-to-help',
          {
            'Email': 'test@test.com',
            'Message': 'message',
            'IsOptedIn': true
          }).calledOnce).toBeTruthy()
      })

      it('should show user it is loading', function () {
        expect(browserLoadingStub.calledOnce).toBeTruthy()
      })

      it('should show user then that is loaded', function () {
        expect(browserLoadedStub.calledAfter(browserLoadingStub)).toBeTruthy()
      })

      it('should set isFormSubmitSuccessful to true', function () {
        expect(model.isFormSubmitSuccessful()).toBeTruthy()
      })

      it('should set isFormSubmitFailure to false', function () {
        expect(model.isFormSubmitFailure()).toBeFalsy()
      })

      it('should track event', function () {
        expect(browserTrackEventStub.withArgs('give-item-submit-details', 'submit-form', 'success').calledOnce).toBeTruthy()
      })
    })
  })
})
