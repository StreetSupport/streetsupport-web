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
  var urlParamStub
  var needId = needData().needId
  var providerId = needData().serviceProviderId

  describe('Validation', function() {
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
                'data': needData()
              })
            }
          })

      postToApiStub = sinon.stub(postToApi, 'post')

      model = new Model()

      model.submit()
    })

    afterEach(function () {
      postToApi.post.restore()
    })


    it('should not post form to api', function () {
      expect(postToApiStub.calledOnce).toBeFalsy()
    })
  })
})

function needData() {
  return {
    'id': '56d81bad92855625087e9a93',
    'description': 'need description',
    'serviceProviderId': 'albert-kennedy-trust',
    'type': 'Things',
    'reason': 'test',
    'moreInfoUrl': 'http://moreinfo.com',
    'postcode': 'm1 3ly',
    'instructions': 'set',
    'email': null,
    'donationAmountInPounds': 0,
    'donationUrl': null
  }
}
