/* global describe, beforeEach, afterEach, it, expect */

const ajaxGet = require('../../../src/js/get-api-data')
const sinon = require('sinon')
const Model = require('../../../src/js/models/accommodation/listing')
const endpoints = require('../../../src/js/api')
const browser = require('../../../src/js/browser')
const locationSelector = require('../../../src/js/location/locationSelector')
const querystring = require('../../../src/js/get-url-parameter')

import { data } from './testdata'

describe('Accommodation - Listing', function () {
  let sut = null
  let ajaxGetStub = null
  let browserLoadingStub = null
  let browserLoadedStub = null
  let browserPushHistoryStub = null

  beforeEach(() => {
    ajaxGetStub = sinon.stub(ajaxGet, 'data')
      .returns({
        then: function (success, error) {
          success({
            'status': 'ok',
            'statusCode': 200,
            'data': data
          })
        }
      })
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    browserPushHistoryStub = sinon.stub(browser, 'pushHistory')
    sinon.stub(querystring, 'parameter')
    sinon.stub(locationSelector, 'getCurrent')
      .returns({
        then: function (success, error) {
          success({
            latitude: 123.4,
            longitude: 567.8
          })
        }
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
  })

  it('- should notify user is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
  })

  it('- should get data from api', () => {
    const calledAsExpected = ajaxGetStub
      .withArgs(`${endpoints.accommodation}?latitude=123.4&longitude=567.8`)
      .calledAfter(browserLoadingStub)
    expect(calledAsExpected).toBeTruthy()
  })

  it('- should map items to collection', () => {
    expect(sut.itemsToDisplay().length).toEqual(4)
  })

  it('- should map mapIndex as zero-base-indexed', () => {
    sut.itemsToDisplay()
      .forEach((e, i) => {
        expect(e.mapIndex()).toEqual(i)
      })
  })

  it('- should map mapIndexToDisplay as one-base-indexed', () => {
    sut.itemsToDisplay()
      .forEach((e, i) => {
        expect(e.mapIndexToDisplay()).toEqual(i + 1)
      })
  })

  it('- should map id', () => {
    expect(sut.itemsToDisplay()[0].id()).toEqual(data.items[0].id)
  })

  it('- should map latitude', () => {
    expect(sut.itemsToDisplay()[0].latitude()).toEqual(data.items[0].latitude)
  })

  it('- should map longitude', () => {
    expect(sut.itemsToDisplay()[0].longitude()).toEqual(data.items[0].longitude)
  })

  it('- should set as not active', () => {
    expect(sut.itemsToDisplay()[0].isActive()).toBeFalsy()
  })

  it('- should map name', () => {
    expect(sut.itemsToDisplay()[0].name()).toEqual(data.items[0].name)
  })

  it('- should format address', () => {
    expect(sut.itemsToDisplay()[0].address()).toEqual('street line 1, street line 2, manchester. m15 4qx')
  })

  it('- should map additionalInfo', () => {
    expect(sut.itemsToDisplay()[0].additionalInfo()).toEqual(data.items[0].additionalInfo)
  })

  it('- should map is open access', () => {
    expect(sut.itemsToDisplay()[0].isOpenAccess()).toEqual(data.items[0].isOpenAccess)
  })

  it('- should map type', () => {
    expect(sut.itemsToDisplay()[0].accommodationType()).toEqual(data.items[0].accommodationType)
  })

  it('- should notify user is loaded', () => {
    expect(browserLoadedStub.calledAfter(ajaxGetStub)).toBeTruthy()
  })

  it('- should set data is loaded to true', () => {
    expect(sut.dataIsLoaded()).toBeTruthy()
  })

  it('- should set details url', () => {
    expect(sut.itemsToDisplay()[0].detailsUrl()).toEqual(`details?id=${data.items[0].id}`)
  })

  it('- should set types filters', () => {
    expect(sut.typeFilters().length).toEqual(3)
    expect(sut.typeFilters()[0].typeName()).toEqual('all')
    expect(sut.typeFilters()[1].typeName()).toEqual('hosted')
    expect(sut.typeFilters()[2].typeName()).toEqual('hostel')
  })

  it('- should set all filter as selected', () => {
    expect(sut.typeFilters()[0].isSelected()).toBeTruthy()
  })

  it('- should set selected filter as all', () => {
    expect(sut.selectedTypeFilterName()).toEqual('all')
  })

  describe('- item clicked', () => {
    beforeEach(() => {
      sut.itemsToDisplay()[0].selectItem()
    })

    it('- should set is active', () => {
      expect(sut.itemsToDisplay()[0].isActive()).toBeTruthy()
    })

    it('- should set other items as not active', () => {
      sut.itemsToDisplay()
        .filter((i) => i.id !== sut.itemsToDisplay()[0].id)
        .forEach((e) => {
          expect(e.isActive()).toBeFalsy()
        })
    })
  })

  describe('- filter selected', () => {
    const filterIndexToSelect = 1 // hosted

    beforeEach(() => {
      sut.selectedTypeFilterName('hosted')
    })

    it('- should set is as selected', () => {
      expect(sut.typeFilters()[filterIndexToSelect].isSelected()).toBeTruthy()
    })

    it('- should set others as not selected', () => {
      sut.typeFilters()
        .filter((tf, i) => i !== filterIndexToSelect)
        .forEach((tf, i) => {
          expect(tf.isSelected()).toBeFalsy()
        })
    })

    it('- should hide accom items not of selected type', () => {
      expect(sut.itemsToDisplay().length).toEqual(2)
    })

    it('- should update url', () => {
      expect(browserPushHistoryStub.withArgs({}, `hosted Accommodation - Street Support`, `?filterId=hosted`).called).toBeTruthy()
    })

    describe('- clear filter', () => {
      const filterIndexToSelect = 0 // all

      beforeEach(() => {
        sut.typeFilters()[filterIndexToSelect].select()
      })

      it('- should set is as selected', () => {
        expect(sut.typeFilters()[filterIndexToSelect].isSelected()).toBeTruthy()
      })

      it('- should set others as not selected', () => {
        sut.typeFilters()
          .filter((tf, i) => i !== filterIndexToSelect)
          .forEach((tf, i) => {
            expect(tf.isSelected()).toBeFalsy()
          })
      })

      it('- should clear filter', () => {
        expect(sut.itemsToDisplay().length).toEqual(4)
      })
    })
  })
})
