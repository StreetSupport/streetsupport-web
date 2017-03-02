/* global describe, beforeEach, afterEach, it, expect */

const sut = require('../../../../src/js/location/locationSelector')
const modal = require('../../../../src/js/location/modal')
const deviceGeo = require('../../../../src/js/location/get-location')

const browser = require('../../../../src/js/browser')
const cookies = require('../../../../src/js/cookies')
const querystring = require('../../../../src/js/get-url-parameter')

const sinon = require('sinon')

describe('Location Selector - get current - first visit', () => {
  let modalInitStub = null

  beforeEach(() => {
    modalInitStub = sinon.stub(modal, 'init')
    sinon.stub(deviceGeo, 'isAvailable')
      .returns(false)
    sinon.stub(cookies, 'get')
      .withArgs('desired-location')
      .returns('')
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
    deviceGeo.isAvailable.restore()
    browser.location.restore()
    cookies.get.restore()
    querystring.parameter.restore()
  })

  it('- should display modal', () => {
    sut.getCurrent()
      .then((success) => {
        expect(modalInitStub.calledOnce).toBeTruthy()
      })
  })
})
