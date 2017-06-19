/* global describe, beforeEach, afterEach, it, expect */

const sut = require('../../../../src/js/location/locationSelector')
const modal = require('../../../../src/js/location/modal')

const ajaxGet = require('../../../../src/js/get-api-data')
const browser = require('../../../../src/js/browser')
const cookies = require('../../../../src/js/cookies')
const querystring = require('../../../../src/js/get-url-parameter')
const deviceGeo = require('../../../../src/js/location/get-location')

const sinon = require('sinon')

import * as storage from '../../../../src/js/storage'

describe('Location Selector - get current - use my location defined in querystring, but city already saved', () => {
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
            coords: hullCoords
          })
        }
      })
    sinon.stub(storage, 'get')
    sinon.stub(storage, 'set')
  })

  afterEach(() => {
    ajaxGet.data.restore()
    modal.init.restore()
    browser.location.restore()
    cookies.get.restore()
    querystring.parameter.restore()
    deviceGeo.location.restore()
    deviceGeo.isAvailable.restore()
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

  it('- should set location name as my location', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.name).toEqual('my location')
        done()
      })
  })

  it('- should set location postcode as nearest postcode', (done) => {
    sut.getCurrent()
      .then((result) => {
        expect(result.postcode).toEqual('hull postcode')
        done()
      })
  })
})
