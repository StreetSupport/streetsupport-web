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

  describe('Happy Path', function() {
    beforeEach(function () {
      sinon.stub(getUrlParams, 'parameter')
        .withArgs('needId')
        .returns(needId)

      getFromApiStub = sinon.stub(getFromApi, 'data')
        .withArgs(endpoints.needs + needId)
        .returns({
          then: function(success, error) {
              success({
                'status': 'ok',
                'data': needData()
              })
            }
          })

      model = new Model()
    })

    afterEach(function () {
      getFromApi.data.restore()
      getUrlParams.parameter.restore()
    })

    it('should get need data', function () {
      expect(getFromApiStub.calledOnce).toBeTruthy();
    })
  })
})

function needData() {
  return {
    'id': '56d81bad92855625087e9a93',
    'description': 'desc',
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
