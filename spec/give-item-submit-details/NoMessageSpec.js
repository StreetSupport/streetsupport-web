/* global describe, beforeEach, afterEach, it, expect */

var postToApi = require('../../src/js/post-api-data')
var getFromApi = require('../../src/js/get-api-data')
var sinon = require('sinon')
var Model = require('../../src/js/models/GiveItemModel')
var getUrlParams = require('../../src/js/get-url-parameter')
var browser = require('../../src/js/browser')
var endpoints = require('../../src/js/api')
var needData = require('./needData')

describe('Give Item Model', function () {
  var model
  var urlParamStub
  var needId = needData.data.needId

  describe('No Message', function() {
    var postToApiStub
    beforeEach(function () {
      urlParamStub = sinon.stub(getUrlParams, 'parameter')
      urlParamStub.withArgs('id')
        .returns(needId)

      sinon.stub(getFromApi, 'data')
        .withArgs(endpoints.needs + needId)
        .returns({
          then: function(success, error) {
              success({
                'status': 'ok',
                'data': needData.data
              })
            }
          })

      postToApiStub = sinon.stub(postToApi, 'post')

      sinon.stub(browser, 'loading')

      model = new Model()
      model.formModel().email('test@test.com')

      model.submit()
    })

    afterEach(function () {
      getUrlParams.parameter.restore()
      getFromApi.data.restore()
      postToApi.post.restore()
      browser.loading.restore()
    })


    it('should not post form to api', function () {
      expect(postToApiStub.calledOnce).toBeFalsy()
    })
  })
})
