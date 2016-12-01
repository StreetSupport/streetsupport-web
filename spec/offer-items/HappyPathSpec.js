/* global describe, beforeEach, afterEach, it, expect */

var getApi = require('../../src/js/get-api-data')
var postToApi = require('../../src/js/post-api-data')
var sinon = require('sinon')
var Model = require('../../src/js/models/OfferItemsModel')
var endpoints = require('../../src/js/api')
var browser = require('../../src/js/browser')

describe('Offer Items', () => {
  let model = null
  let browserLoadingStub = null
  let browserLoadedStub = null
  let browserTrackEventStub = null

  beforeEach(() => {
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    sinon.stub(getApi, 'data')
      .returns({
        then: function (success, error) {
          success({
            'status': 'created',
            'statusCode': 200,
            'data': catData
          })
        }
      })

    model = new Model()
  })

  afterEach(() => {
    browser.loading.restore()
    browser.loaded.restore()
    getApi.data.restore()
  })

  it('- Should populate categories', () => {
    expect(model.categories().length).toEqual(10)
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
