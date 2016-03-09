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

  describe('Need not found', function() {
    var browserStub

    beforeEach(function() {
      sinon.stub(getUrlParams, 'parameter')
        .withArgs('needId')
        .returns(needId)

      getFromApiStub = sinon.stub(getFromApi, 'data')
        .withArgs(endpoints.needs + needId)
        .returns({
          then: function(success, error) {
              error({
                'status': 'error',
                'statusCode': 404,
                'message': ''
              })
            }
          })

      browserStub = sinon.stub(browser, 'redirect')
        .withArgs('404.html')

      model = new Model()
    })

    afterEach(function () {
      getFromApi.data.restore()
      getUrlParams.parameter.restore()
      browser.redirect.restore()
    })

    it('should redirect to 404', function() {
      expect(browserStub.calledOnce).toBeTruthy()
    })
  })
})
