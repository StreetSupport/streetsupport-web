
/* global describe, beforeEach, afterEach, it, expect */

var postToApi = require('../../src/js/post-api-data')
var sinon = require('sinon')
var Model = require('../../src/js/models/give-help/offer-items/OfferItemsModel')
var endpoints = require('../../src/js/api')
var browser = require('../../src/js/browser')

describe('Offer Items - No Categories Other Description Supplied', () => {
  let model = null
  let browserLoadingStub = null
  let browserLoadedStub = null

  beforeEach(() => {
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'scrollTo')

    model = new Model('manchester')
  })

  afterEach(() => {
    browser.loading.restore()
    browser.loaded.restore()
    browser.scrollTo.restore()
  })

  describe('- Post Offer', () => {
    let postStub = null

    beforeEach(() => {
      postStub = sinon
        .stub(postToApi, 'post')
        .returns({
          then: function (success, error) {
            success({
              'status': 'created',
              'statusCode': 201
            })
          }
        })

      browserLoadingStub.reset()
      browserLoadedStub.reset()

      model.firstName('first')
      model.lastName('last')
      model.email('email@test.com')
      model.postcode('postcode')
      model.description('description')
      model.otherCategory('other category description')

      model.submitForm()
    })

    afterEach(() => {
      postToApi.post.restore()
    })

    it('- Should notify user it is loading', () => {
      expect(browserLoadingStub.calledOnce).toBeTruthy
    })

    it('- Should post payload', () => {
      expect(postStub
        .withArgs(endpoints.createOfferOfItems,
        {
          'FirstName': 'first',
          'LastName': 'last',
          'Email': 'email@test.com',
          'Telephone': '',
          'City': 'manchester',
          'Postcode': 'postcode',
          'Description': 'description',
          'AdditionalInfo': '',
          'SelectedCategories': [],
          'IsOptedIn': false,
          'OtherCategory': 'other category description'
        }).calledAfter(browserLoadingStub)).toBeTruthy()
    })

    it('- Should notify user it is loaded', () => {
      expect(browserLoadingStub.calledAfter(postStub)).toBeTruthy
    })

    it('- Should set isSubmitted', () => {
      expect(model.isSubmitted()).toBeTruthy()
    })

    it('- Should set isSuccess', () => {
      expect(model.isSuccess()).toBeTruthy()
    })
  })
})
