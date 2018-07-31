/* global describe, beforeEach, afterEach, it, expect */

var getApi = require('../../src/js/get-api-data')
var postToApi = require('../../src/js/post-api-data')
var sinon = require('sinon')
var Model = require('../../src/js/models/give-help/offer-items/OfferItemsModel')
var browser = require('../../src/js/browser')

describe('Offer Items - No Categories, No Other Description', () => {
  let model = null
  let postStub = null

  beforeEach(() => {
    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')
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
    postStub = sinon
      .stub(postToApi, 'post')

    model = new Model('manchester')

    model.firstName('first')
    model.lastName('last')
    model.email('email@test.com')
    model.postcode('postcode')
    model.description('description')

    model.submitForm()
  })

  afterEach(() => {
    getApi.data.restore()
    postToApi.post.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.jumpTo.restore()
    browser.scrollTo.restore()
  })

  it('- Should not post payload', () => {
    expect(postStub.calledOnce).toBeFalsy()
  })

  it('- Should not set isSubmitted', () => {
    expect(model.isSubmitted()).toBeFalsy()
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
