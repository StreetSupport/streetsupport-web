/* global describe, beforeEach, afterEach, it, expect */

var postToApi = require('../../src/js/post-api-data')
var sinon = require('sinon')
var Model = require('../../src/js/models/GiveItemModel')
var browser = require('../../src/js/browser')

describe('Give Item Model', function () {
  var model

  describe('No Message', function () {
    var postToApiStub
    beforeEach(function () {
      postToApiStub = sinon.stub(postToApi, 'post')

      sinon.stub(browser, 'loading')

      model = new Model()
      model.formModel().email('test@test.com')

      model.submit()
    })

    afterEach(function () {
      postToApi.post.restore()
      browser.loading.restore()
    })

    it('should not post form to api', function () {
      expect(postToApiStub.calledOnce).toBeFalsy()
    })
  })
})
