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
  var needId = needData.data.needId
  var providerId = needData.data.serviceProviderId
  var browserLoaderStub

  describe('Invalid Email Address', function() {
    var postToApiStub
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

      browserLoaderStub = sinon.stub(browser, 'loading')

      model = new Model()
      model.formModel().email('invalid email address')
      model.formModel().message('message')

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
