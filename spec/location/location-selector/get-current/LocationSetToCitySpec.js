/* global describe, beforeEach, afterEach, it, expect */

const sut = require('../../../../src/js/location/locationSelector')
const modal = require('../../../../src/js/location/modal')
const supportedCities = require('../../../../src/js/location/supportedCities')

const browser = require('../../../../src/js/browser')
const cookies = require('../../../../src/js/cookies')
const querystring = require('../../../../src/js/get-url-parameter')

const sinon = require('sinon')

describe('Location Selector - get current - location set to a city', () => {
  let modalInitStub = null

  beforeEach(() => {
    modalInitStub = sinon.stub(modal, 'init')
    sinon.stub(cookies, 'get')
      .withArgs(cookies.keys.location)
      .returns('manchester')
    sinon.stub(browser, 'location')
      .returns({
        pathname: 'https://streetsupport.net/page'
      })
    sinon.stub(querystring, 'parameter')
      .withArgs('location')
      .returns('')
  })

  afterEach(() => {
    modal.init.restore()
    browser.location.restore()
    cookies.get.restore()
    querystring.parameter.restore()
  })

  it('- should not display modal', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(modalInitStub.calledOnce).toBeFalsy()
        done()
      })
  })

  it('- should return saved city', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.id).toEqual('manchester')
        done()
      })
  })

  it('- should return city latitude', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.latitude).toEqual(supportedCities.get('manchester').latitude)
        done()
      })
  })

  it('- should return city longitude', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.longitude).toEqual(supportedCities.get('manchester').longitude)
        done()
      })
  })
})
