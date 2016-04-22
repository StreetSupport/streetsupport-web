/* global describe, beforeEach, afterEach, it, expect */

var postToApi = require('../../src/js/post-api-data')
var sinon = require('sinon')
var Model = require('../../src/js/models/JoinStreetSupportModel')
var browser = require('../../src/js/browser')

describe('Join Street Support Model', function () {
  var model
  var postToApiStub

  describe('No Name', function () {
    beforeEach(function () {
      postToApiStub = sinon.stub(postToApi, 'post')
      sinon.stub(browser, 'loading')

      model = new Model()

      model.formModel().email('test@test.com')
      model.formModel().reason('reason')
      model.formModel().location('location')
      model.formModel().isOptedIn(true)

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
