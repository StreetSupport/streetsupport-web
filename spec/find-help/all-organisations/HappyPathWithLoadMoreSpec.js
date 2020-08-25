/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')

const ajax = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const endpoints = require('../../../src/js/api')
const location = require('../../../src/js/location/locationSelector')
const Model = require('../../../src/js/models/all-organisations/listing')
const spLocationData = require('./spLocationData')
const querystring = require('../../../src/js/get-url-parameter')

describe('all organisations', () => {
  const locationResult = {
    'id': 'my-location',
    'findHelpId': 'my-location',
    'name': 'my selected postcode',
    'longitude': 123.4,
    'latitude': 567.8,
    'isPublic': true,
    'isSelectableInBody': false,
    'postcode': 'M1 2HX'
  }

  let ajaxStub = null
  let browserLoadingStub = null
  let browserLoadedStub = null

  let sut = null

  beforeEach(() => {
    sinon.stub(querystring, 'parameter')

    sinon.stub(location, 'getPreviouslySetPostcode')
      .returns({
        then: (success) => {
          success(locationResult)
        }
      })

    ajaxStub = sinon.stub(ajax, 'data')
    ajaxStub
      .returns({
        then: (success) => {
          success({
            'status': 'ok',
            'statusCode': 200,
            'data': spLocationData.page1
          })
        }
      })
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')

    sut = new Model(null, 8)
  })

  afterEach(() => {
    ajax.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    location.getPreviouslySetPostcode.restore()
    querystring.parameter.restore()
  })

    describe('- click load more 1st time', () => {
      beforeEach(() => {
        sut.loadMore()
      })

      it('- should show load more button', () => {
        expect(sut.hasMorePages()).toBeTruthy()
      })

      it('- should be indexPage equals to 16', () => {
        expect(sut.pageIndex()).toEqual(16)
      })

      describe('- click load more many times', () => {
        beforeEach(() => {
          sut.loadMore()
          sut.loadMore()
          sut.loadMore()
          sut.loadMore()
          sut.loadMore()
          sut.loadMore()
        })

        it('- should not show load more button', () => {
          expect(sut.hasMorePages()).toBeFalsy()
        })

        it('- should be indexPage equals to 64', () => {
          expect(sut.pageIndex()).toEqual(64)
        })
      })
    })
})
