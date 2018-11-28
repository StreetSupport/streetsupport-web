/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

const api = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const locationSelector = require('../../../src/js/location/locationSelector')
const Model = require('../../../src/js/models/give-help/requests/listing')
const needsData = require('./needsData')
const querystring = require('../../../src/js/get-url-parameter')
const storage = require('../../../src/js/storage')

describe('Needs Listing - sorting', () => {
  let ajaxGetStub,
    sut

  const previouslySetLocation = {
    latitude: 123.4,
    longitude: 567.8,
    postcode: 'postcode'
  }

  beforeEach(() => {
    ajaxGetStub = sinon.stub(api, 'data')
    ajaxGetStub
      .returns({
        then: function (success) {
          success({ data: needsData.page1 })
        }
      })
    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')
    sinon.stub(browser, 'location')
    sinon.stub(browser, 'pushHistory')
    sinon.stub(browser, 'setOnHistoryPop')
      .returns({})
    sinon.stub(locationSelector, 'getPreviouslySetPostcode')
      .returns({
        then: function (success) {
          success(previouslySetLocation)
        }
      })
    sinon.stub(querystring, 'parameter')
    sinon.stub(storage, 'get').returns(previouslySetLocation)

    sut = new Model()
  })

  afterEach(() => {
    api.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    browser.location.restore()
    browser.pushHistory.restore()
    browser.setOnHistoryPop.restore()
    locationSelector.getPreviouslySetPostcode.restore()
    querystring.parameter.restore()
    storage.get.restore()
  })

  it('- should initially sort by needed date', () => {
    const first = sut.needsToDisplay()[0]
    const last = sut.needsToDisplay()[sut.needsToDisplay().length - 1]
    expect(first.neededDate()).toBeGreaterThanOrEqual(last.neededDate())
  })

  describe('- by organisation', () => {
    beforeEach(() => {
      sut.sortByOrganisation()
    })

    it('- should sort by org name', () => {
      const first = sut.needsToDisplay()[0]
      const last = sut.needsToDisplay()[sut.needsToDisplay().length - 1]
      expect(first.serviceProviderName()).toBeLessThanOrEqual(last.serviceProviderName())
    })
  })

  describe('- by distance', () => {
    beforeEach(() => {
      sut.sortByDistance()
    })

    it('- should sort by org name', () => {
      const first = sut.needsToDisplay()[0]
      const last = sut.needsToDisplay()[sut.needsToDisplay().length - 1]
      expect(first.distanceAwayInMetres()).toBeLessThanOrEqual(last.distanceAwayInMetres())
    })
  })

  describe('- by date added', () => {
    beforeEach(() => {
      sut.sortByOrganisation()
      sut.sortByDateAdded()
    })

    it('- should sort by date added', () => {
      const first = sut.needsToDisplay()[0]
      const last = sut.needsToDisplay()[sut.needsToDisplay().length - 1]
      expect(first.neededDate()).toBeGreaterThanOrEqual(last.neededDate())
    })
  })
})
