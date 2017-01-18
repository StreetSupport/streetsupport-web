/* global describe, beforeEach, afterEach, it, expect */

var api = require('../../../../src/js/post-api-data')
var sinon = require('sinon')
var Model = require('../../../../src/js/models/BestPracticeAwardsEnquiries')

describe('Best Practice Awards Enquiries Model - no message entered', function () {
  const sut = new Model()
  let apiStub = null

  beforeEach(() => {
    apiStub = sinon.stub(api, 'post')
    apiStub
      .returns({
        then: function (success, error) {
          success({
            'status': 'created',
            'statusCode': 201
          })
        }
      })

    sut.name('name')
    sut.orgName('org name')
    sut.email('email@test.com')
    sut.telephone('telephone')
    sut.message('message')
    sut.selectedAward('')
    sut.submit()
  })

  afterEach(() => {
    api.post.restore()
  })

  it('- should not post to api', () => {
    expect(apiStub.notCalled).toBeTruthy()
  })
})
