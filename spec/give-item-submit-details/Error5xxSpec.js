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
  var browserRedirectStub
  var browserTrackEventStub
  var needId = needData.data.needId
  var providerId = needData.data.serviceProviderId
  var postToApiStub

  describe('API returns 5xx error', function() {
    beforeEach(function () {
      urlParamStub = sinon.stub(getUrlParams, 'parameter')
      urlParamStub.withArgs('needId')
        .returns(needId)
      urlParamStub.withArgs('providerId')
        .returns(providerId)

      getFromApiStub = sinon.stub(getFromApi, 'data')
        .withArgs(endpoints.allServiceProviders + providerId + '/needs/' + needId)
        .returns({
          then: function(success, error) {
              success({
                'status': 'ok',
                'data': needData.data
              })
            }
          })

      postToApiStub = sinon.stub(postToApi, 'post')
      postToApiStub.returns({
        then: function(success, error) {
          error(new Error('borked'))
        }
      })

      browserLoadingStub = sinon.stub(browser, 'loading')
      browserLoadedStub = sinon.stub(browser, 'loaded')
      browserRedirectStub = sinon.stub(browser, 'redirect')
      browserTrackEventStub = sinon.stub(browser, 'trackEvent')

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

    it('should redirect to 500.html', function () {
      expect(browserRedirectStub.withArgs('500.html').calledOnce).toBeTruthy()
    })
  })
})
