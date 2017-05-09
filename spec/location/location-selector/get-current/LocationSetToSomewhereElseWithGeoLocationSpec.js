/* global describe, beforeEach, afterEach, it, expect */

const sut = require('../../../../src/js/location/locationSelector')
const modal = require('../../../../src/js/location/modal')
const deviceGeo = require('../../../../src/js/location/get-location')

const browser = require('../../../../src/js/browser')
const cookies = require('../../../../src/js/cookies')
const querystring = require('../../../../src/js/get-url-parameter')

const sinon = require('sinon')

describe('Location Selector - get current - location set to somewhere else - with geo location', () => {
  let modalInitStub = null

  beforeEach(() => {
    modalInitStub = sinon.stub(modal, 'init')
    sinon.stub(cookies, 'get')
      .withArgs('desired-location')
      .returns('elsewhere')
    sinon.stub(browser, 'location')
      .returns({
        pathname: 'https://streetsupport.net/page'
      })
    sinon.stub(querystring, 'parameter')
      .withArgs('location')
      .returns('')
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
    deviceGeo.isAvailable.restore()
    deviceGeo.location.restore()
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

  it('- should return elsewhere', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.id).toEqual('elsewhere')
        done()
      })
  })

  it('- should return city latitude', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.latitude).toEqual(53.745671)
        done()
      })
  })

  it('- should return city longitude', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.longitude).toEqual(-0.336741)
        done()
      })
  })
})
