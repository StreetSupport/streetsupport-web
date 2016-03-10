var postToApi = require('../../src/js/post-api-data')
var getFromApi = require('../../src/js/get-api-data')
var sinon = require('sinon')
var Model = require('../../src/js/models/GiveItemModel')
var endpoints = require('../../src/js/api')
var getUrlParams = require('../../src/js/get-url-parameter')
var browser = require('../../src/js/browser')

describe('Give Item Model', function () {
  var model
  var getFromApiStub
  var needId = '56d81bad92855625087e9a93'
  var providerId = 'albert-kennedy-trust'
  var browserLoaderStub

  describe('Need not found', function() {
    var browserStub
    var urlParamStub

    beforeEach(function() {
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
                'status': 'error',
                'statusCode': 404,
                'message': ''
              })
            }
          })

      browserStub = sinon.stub(browser, 'redirect')
      browserLoaderStub = sinon.stub(browser, 'loading')

      model = new Model()
    })

    afterEach(function () {
      getFromApi.data.restore()
      getUrlParams.parameter.restore()
      browser.redirect.restore()
      browser.loading.restore()
    })

    it('should redirect to 404', function() {
      expect(browserStub.withArgs('404.html').calledOnce).toBeTruthy()
    })
  })
})
