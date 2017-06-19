/* global describe, beforeEach, afterEach, it, expect */

const sut = require('../../../../src/js/location/locationSelector')
const modal = require('../../../../src/js/location/modal')
const deviceGeo = require('../../../../src/js/location/get-location')

const ajaxGet = require('../../../../src/js/get-api-data')
const browser = require('../../../../src/js/browser')
const cookies = require('../../../../src/js/cookies')
const querystring = require('../../../../src/js/get-url-parameter')

const sinon = require('sinon')

import * as storage from '../../../../src/js/storage'

describe('Location Selector - get current - location set to somewhere else - with geo location', () => {
  let modalInitStub = null
  const hullCoords = {
    longitude: -0.336741,
    latitude: 53.745671
  }

  beforeEach(() => {
    modalInitStub = sinon.stub(modal, 'init')
    sinon.stub(ajaxGet, 'data')
      .withArgs(`https://api.postcodes.io/postcodes?lon=${hullCoords.longitude}&lat=${hullCoords.latitude}`)
      .returns({
        then: function (success, error) {
          success({
            data: {
              result: [
                {
                  postcode: 'hull postcode'
                }
              ]
            }
          })
        }
      })
    sinon.stub(cookies, 'get')
      .withArgs(cookies.keys.location)
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
            coords: hullCoords
          })
        }
      })
    sinon.stub(storage, 'get')
    sinon.stub(storage, 'set')
  })

  afterEach(() => {
    ajaxGet.data.restore()
    deviceGeo.isAvailable.restore()
    deviceGeo.location.restore()
    modal.init.restore()
    browser.location.restore()
    cookies.get.restore()
    querystring.parameter.restore()
    storage.get.restore()
    storage.set.restore()
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

  it('- should return geo latitude', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.latitude).toEqual(53.745671)
        done()
      })
  })

  it('- should return geo longitude', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.longitude).toEqual(-0.336741)
        done()
      })
  })
})
