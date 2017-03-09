/* global describe, beforeEach, afterEach, it, expect */

const sut = require('../../../../src/js/location/locationSelector')
const modal = require('../../../../src/js/location/modal')

const browser = require('../../../../src/js/browser')
const cookies = require('../../../../src/js/cookies')
const querystring = require('../../../../src/js/get-url-parameter')
const deviceGeo = require('../../../../src/js/location/get-location')

const sinon = require('sinon')

describe('Location Selector - get current - use my location defined in querystring', () => {
  let modalInitStub = null

  beforeEach(() => {
    modalInitStub = sinon.stub(modal, 'init')
    sinon.stub(cookies, 'get')
      .withArgs('desired-location')
      .returns('manchester')
    sinon.stub(browser, 'location')
      .returns({
        pathname: 'https://streetsupport.net/page'
      })
    sinon.stub(querystring, 'parameter')
      .withArgs('location')
      .returns('my-location')
    sinon.stub(deviceGeo, 'isAvailable')
      .returns(true)
    sinon.stub(deviceGeo, 'location')
      .returns({
        then: function (success, error) {
          success({
            coords: {
              longitude: -0.336741,
              latitude: 53.745671 // hull!
            }
          })
        }
      })
  })

  afterEach(() => {
    modal.init.restore()
    browser.location.restore()
    cookies.get.restore()
    querystring.parameter.restore()
    deviceGeo.location.restore()
    deviceGeo.isAvailable.restore()
  })

  it('- should not display modal', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(modalInitStub.calledOnce).toBeFalsy()
        done()
      })
  })

  it('- should return id as my-location', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.id).toEqual('manchester')
        done()
      })
  })

  it('- should return find help id as my-location', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.findHelpId).toEqual('my-location')
        done()
      })
  })

  it('- should return device latitude', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.latitude).toEqual(53.745671)
        done()
      })
  })

  it('- should return device longitude', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.longitude).toEqual(-0.336741)
        done()
      })
  })
})
