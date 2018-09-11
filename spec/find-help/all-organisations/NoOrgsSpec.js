/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')

const ajax = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const location = require('../../../src/js/location/locationSelector')
const Model = require('../../../src/js/models/all-organisations/listing')

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

  let sut = null

  beforeEach(() => {
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
            'data': {
              items: []
            }
          })
        }
      })
    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')

    sut = new Model()
  })

  afterEach(() => {
    ajax.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    location.getPreviouslySetPostcode.restore()
  })

  it('- should set hasOrgs to false', () => {
    expect(sut.hasOrgs()).toBeFalsy()
  })
})
