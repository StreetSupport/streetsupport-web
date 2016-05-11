/* global describe, beforeEach, afterEach, it, expect */

var postToApi = require('../../src/js/post-api-data')
var sinon = require('sinon')
var Model = require('../../src/js/models/GiveItemModel')
var browser = require('../../src/js/browser')

describe('Give Item Model', function () {
  var model
  var browserRedirectStub
  var postToApiStub

  describe('API returns 5xx error', function () {
    beforeEach(function () {
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
