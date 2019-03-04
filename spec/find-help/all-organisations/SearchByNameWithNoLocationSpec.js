/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')

const ajax = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const endpoints = require('../../../src/js/api')
const location = require('../../../src/js/location/locationSelector')
const Model = require('../../../src/js/models/all-organisations/listing')
const spLocationData = require('./spLocationData')

describe('all organisations - search by name - no location set', () => {
  const locationResult = null
  let ajaxStub = null
  let sut = null

  beforeEach(() => {
    sinon.stub(location, 'getPreviouslySetPostcode')
      .returns({
        then: (success) => {
          success(locationResult)
        }
      })

    ajaxStub = sinon.stub(ajax, 'data')
    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')

    ajaxStub
      .withArgs(`${endpoints.serviceProviderLocations}?providerName=coffee`)
      .returns({
        then: (success) => {
          success({
            'status': 'ok',
            'statusCode': 200,
            'data': spLocationData.coffee
          })
        }
      })

    sut = new Model()
    sut.searchQuery('coffee')
    sut.search()
  })

  afterEach(() => {
    ajax.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    location.getPreviouslySetPostcode.restore()
  })

  it('- should filter by search query', () => {
    expect(sut.orgsToDisplay().length).toEqual(1)
    expect(sut.orgsToDisplay()[0].key).toEqual('coffee4craig')
  })
})
