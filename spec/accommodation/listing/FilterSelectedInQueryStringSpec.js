/* global describe, beforeEach, afterEach, it, expect */

const ajaxGet = require('../../../src/js/get-api-data')
const sinon = require('sinon')
const Model = require('../../../src/js/models/accommodation/listing')
const gMaps = require('../../../src/js/models/accommodation/googleMaps')
const browser = require('../../../src/js/browser')
const querystring = require('../../../src/js/get-url-parameter')
const locationSelector = require('../../../src/js/location/locationSelector')

import { data } from './testdata'

describe('Accommodation - Listing - Filter selected in querystring', function () {
  let sut = null

  const selectedType = 'hosted'

  beforeEach(() => {
    sinon.stub(ajaxGet, 'data')
      .returns({
        then: function (success, error) {
          success({
            'status': 'ok',
            'statusCode': 200,
            'data': data
          })
        }
      })
    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'pushHistory')
    sinon.stub(querystring, 'parameter')
      .withArgs('filterId')
      .returns(selectedType)
    sinon.stub(locationSelector, 'getCurrent')
      .returns({
        then: function (success, error) {
          success({
            latitude: 123.4,
            longitude: 567.8
          })
        }
      })
    sinon.stub(gMaps, 'buildMap')
    sinon.stub(gMaps, 'buildMarker').returns({
      addListener: () => { },
      setVisible: sinon.spy(),
      setMap: sinon.spy()
    })
    sinon.stub(gMaps, 'buildInfoWindow').returns({
      open: sinon.spy(),
      close: sinon.spy()
    })

    sut = new Model()
  })

  afterEach(() => {
    ajaxGet.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.pushHistory.restore()
    querystring.parameter.restore()
    locationSelector.getCurrent.restore()
    gMaps.buildMap.restore()
    gMaps.buildMarker.restore()
    gMaps.buildInfoWindow.restore()
  })

  it('- should set is as selected', () => {
    expect(sut.typeFilters().find((tf) => tf.typeName() === selectedType).isSelected()).toBeTruthy()
  })

  it('- should set others as not selected', () => {
    sut.typeFilters()
      .filter((tf) => tf.typeName() !== selectedType)
      .forEach((tf) => {
        expect(tf.isSelected()).toBeFalsy()
      })
  })

  it('- should hide accom items not of selected type', () => {
    expect(sut.itemsToDisplay().length).toEqual(2)
  })

  it('- should reset markers', () => {
    expect(sut.map.markers.length).toEqual(2)
  })
})
