/* global describe, beforeEach, afterEach, it, expect */

const sut = require('../../../../src/js/location/locationSelector')
const modal = require('../../../../src/js/location/modal')

const browser = require('../../../../src/js/browser')
const cookies = require('../../../../src/js/cookies')
const querystring = require('../../../../src/js/get-url-parameter')

const sinon = require('sinon')

describe('Location Selector - get current - first visit', () => {
  let modalInitStub = null

  beforeEach(() => {
    modalInitStub = sinon.stub(modal, 'init')
    sinon.stub(cookies, 'get')
      .withArgs(cookies.keys.location)
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
    browser.location.restore()
    cookies.get.restore()
    querystring.parameter.restore()
  })

  it('- should display modal', (done) => {
    sut.getCurrent()
      .then((success) => {
        expect(modalInitStub.calledOnce).toBeTruthy()
        done()
      })
  })
})
