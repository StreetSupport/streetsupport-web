/* global describe, beforeEach, afterEach, it, expect */

var api = require('../../../src/js/post-api-data')
var sinon = require('sinon')
var Model = require('../../../src/js/models/BestPracticeEnquiries')
var endpoints = require('../../../src/js/api')
var browser = require('../../../src/js/browser')

describe('Best Practice Enquiries Model', function () {
  const sut = new Model()
  let apiStub = null
  let browserLoadingStub = null
  let browserLoadedStub = null

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

    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')

    sut.name('name')
    sut.orgName('org name')
    sut.email('email@test.com')
    sut.telephone('telephone')
    sut.message('message')
    sut.submit()
  })

  afterEach(() => {
    api.post.restore()
    browser.loading.restore()
    browser.loaded.restore()
  })

  it('- should notify user is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
  })

  it('- should post to api', () => {
    const endpoint = endpoints.bestPracticeEnquiries
    const data = {
      Name: 'name',
      OrganisationName: 'org name',
      Email: 'email@test.com',
      Telephone: 'telephone',
      Message: 'message'
    }
    const apiCalledAsExpected = apiStub
      .withArgs(endpoint, data)
      .calledOnce
    expect(apiCalledAsExpected).toBeTruthy()
  })

  it('- should notify user is loaded', () => {
    expect(browserLoadedStub.calledOnce).toBeTruthy()
  })

  it('- should set form submit successful', () => {
    expect(sut.isFormSubmitSuccessful()).toBeTruthy()
  })
})
