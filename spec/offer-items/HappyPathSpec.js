/* global describe, beforeAll, afterAll, it, expect */

const browser = require('../../src/js/browser')
const endpoints = require('../../src/js/api')
const Model = require('../../src/js/models/give-help/offer-items/OfferItemsModel')
const postToApi = require('../../src/js/post-api-data')
const sinon = require('sinon')
import { categories } from '../../src/data/generated/need-categories'

describe('Offer Items', () => {
  let model = null
  let browserLoadingStub = null
  let browserLoadedStub = null

  beforeAll(() => {
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'jumpTo')
    sinon.stub(browser, 'scrollTo')

    model = new Model('manchester')
  })

  afterAll(() => {
    browser.loading.restore()
    browser.loaded.restore()
    browser.jumpTo.restore()
    browser.scrollTo.restore()
  })

  it('- Should populate categories', () => {
    expect(model.categories().length).toEqual(categories.length)
  })

  describe('- Post Offer', () => {
    let postStub = null

    beforeAll(() => {
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

    afterAll(() => {
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
          'SelectedCategories': [categories[0].key],
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
