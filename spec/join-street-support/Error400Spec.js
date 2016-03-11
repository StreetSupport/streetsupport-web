var postToApi = require('../../src/js/post-api-data')
var sinon = require('sinon')
var Model = require('../../src/js/models/JoinStreetSupportModel')
var endpoints = require('../../src/js/api')
var browser = require('../../src/js/browser')

describe('Join Street Support Model', function () {
  var model
  var browserLoadingStub
  var browserLoadedStub
  var browserTrackEventStub
  var postToApiStub

  describe('API returns 400 error', function() {
    beforeEach(function () {
      postToApiStub = sinon.stub(postToApi, 'post')
      postToApiStub.returns({
        then: function(success, error) {
          success({
            'status': 'error',
            'statusCode': 400,
            'messages': ['error1', 'error2']
          })
        }
      })

      browserLoadingStub = sinon.stub(browser, 'loading')
      browserLoadedStub = sinon.stub(browser, 'loaded')
      browserTrackEventStub = sinon.stub(browser, 'trackEvent')

      model = new Model()

      model.formModel().name('name')
      model.formModel().email('test@test.com')
      model.formModel().reason('reason')
      model.formModel().isOptedIn(true)

      model.submit()
    })

    afterEach(function () {
      browser.loading.restore()
      browser.loaded.restore()
      browser.trackEvent.restore()
      postToApi.post.restore()
    })

    it('should set isFormSubmitFailure to true', function () {
      expect(model.isFormSubmitFailure()).toBeTruthy()
    })

    it('should set api errors', function () {
      expect(model.apiErrors()[0]).toEqual('error1')
      expect(model.apiErrors()[1]).toEqual('error2')
    })
  })
})
