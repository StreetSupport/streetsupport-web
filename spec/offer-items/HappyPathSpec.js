/* global describe, beforeEach, afterEach, it, expect */

var getApi = require('../../src/js/get-api-data')
var postToApi = require('../../src/js/post-api-data')
var sinon = require('sinon')
var Model = require('../../src/js/models/give-help/offer-items/OfferItemsModel')
var endpoints = require('../../src/js/api')
var browser = require('../../src/js/browser')

describe('Offer Items', () => {
  let model = null
  let browserLoadingStub = null
  let browserLoadedStub = null

  beforeEach(() => {
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'jumpTo')
    sinon.stub(browser, 'scrollTo')
    sinon.stub(getApi, 'data')
      .returns({
        then: function (success, error) {
          success({
            'status': 'ok',
            'statusCode': 200,
            'data': catData
          })
        }
      })

    model = new Model('manchester')
  })

  afterEach(() => {
    browser.loading.restore()
    browser.loaded.restore()
    browser.jumpTo.restore()
    browser.scrollTo.restore()
    getApi.data.restore()
  })

  it('- Should populate categories', () => {
    expect(model.categories().length).toEqual(10)
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
      model.categories()[0].isChecked(true)

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
          'SelectedCategories': [catData[0].key],
          'IsOptedIn': false,
          'OtherCategory': ''
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

const catData = [
  {
    'key': 'food-and-drink',
    'value': 'Food and Drink'
  },
  {
    'key': 'toiletries',
    'value': 'Toiletries'
  },
  {
    'key': 'clothes',
    'value': 'Clothes'
  },
  {
    'key': 'materials-for-activities',
    'value': 'Materials for Activities'
  },
  {
    'key': 'services',
    'value': 'Services (printing etc)'
  },
  {
    'key': 'furniture',
    'value': 'Furniture'
  },
  {
    'key': 'bedding',
    'value': 'Bedding'
  },
  {
    'key': 'cleaning-materials',
    'value': 'Cleaning Materials'
  },
  {
    'key': 'kitchenware',
    'value': 'Kitchenware'
  },
  {
    'key': 'electrical-items',
    'value': 'Electrical Items'
  }
]
