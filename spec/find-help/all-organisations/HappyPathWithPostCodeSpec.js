/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')

const ajax = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const endpoints = require('../../../src/js/api')
const location = require('../../../src/js/location/locationSelector')
const Model = require('../../../src/js/models/all-organisations/listing')
const spLocationData = require('./spLocationData')
const querystring = require('../../../src/js/get-url-parameter')

describe('all organisations by postcode', () => {
  const locationResult = {
    'id': 'my-location',
    'findHelpId': 'my-location',
    'name': 'my selected postcode',
    'longitude': 123.4,
    'latitude': 567.8,
    'isPublic': true,
    'isSelectableInBody': false,
    'postcode': 'M1'
  }

  let ajaxStub = null
  let browserLoadingStub = null
  let browserLoadedStub = null

  let sut = null

  beforeEach(() => {
    const queryStringStub = sinon.stub(querystring, 'parameter')
    queryStringStub
      .withArgs('postcode')
      .returns(locationResult.postcode)

    sinon.stub(location, 'setPostcode')
      .returns({
        then: (success) => {
          success(locationResult)
        }
      })

    ajaxStub = sinon.stub(ajax, 'data')
    ajaxStub
      .withArgs(`${endpoints.serviceProviderLocations}?pageSize=1000&latitude=${locationResult.latitude}&longitude=${locationResult.longitude}&range=10000`)
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

    sut = new Model()
  })

  afterEach(() => {
    ajax.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    location.setPostcode.restore()
    querystring.parameter.restore()
  })

  it('- should set postcode from url parameter', () => {
    expect(sut.postcode()).toEqual(locationResult.postcode)
  })
})
