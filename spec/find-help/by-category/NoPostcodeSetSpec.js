/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')
const marked = require('marked')

const browser = require('../../../src/js/browser')
const listToDropdown = require('../../../src/js/list-to-dropdown')
const postcodeLookup = require('../../../src/js/location/postcodes')
const querystring = require('../../../src/js/get-url-parameter')
const storage = require('../../../src/js/storage')

import { categories } from '../../../src/data/generated/service-categories'
import FindHelpByCategory from '../../../src/js/models/find-help/by-category'

describe('Find Help by Category - no postcode set', () => {
  let sut,
    postcodeLookupStub

  beforeEach(() => {
    sinon.stub(browser, 'location')
      .returns({
        pathname: '/find-help/support/'
      })
    sinon.stub(browser, 'pushHistory')
    sinon.stub(listToDropdown, 'init')
    sinon.stub(browser, 'setOnHistoryPop')
    postcodeLookupStub = sinon.stub(postcodeLookup, 'getCoords')
    sinon.stub(querystring, 'parameter')
    sinon.stub(storage, 'get').returns({})

    sut = new FindHelpByCategory()
  })

  afterEach(() => {
    browser.location.restore()
    browser.pushHistory.restore()
    browser.setOnHistoryPop.restore()
    listToDropdown.init.restore()
    postcodeLookup.getCoords.restore()
    querystring.parameter.restore()
    storage.get.restore()
  })

  it('- should set category name', () => {
    const serviceCategory = categories.find((sc) => sc.key === 'support')
    expect(sut.category.categoryName()).toEqual(serviceCategory.name)
  })

  it('- should set category synopsis', () => {
    const serviceCategory = categories.find((sc) => sc.key === 'support')
    expect(sut.category.categorySynopsis()).toEqual(marked(serviceCategory.synopsis))
  })

  it('- should set proximity search range to 10k', () => {
    expect(sut.proximitySearch.range()).toEqual(10000)
  })

  it('- should set postcode to empty', () => {
    expect(sut.proximitySearch.postcode()).toEqual(undefined)
  })

  it('- should set hasItems to false', () => {
    expect(sut.hasItems()).toBeFalsy()
  })

  describe('- search without postcode', () => {
    beforeEach(() => {
      sut.proximitySearch.search()
    })

    it('- should not attempt postcode lookup', () => {
      expect(postcodeLookupStub.notCalled).toBeTruthy()
    })
  })
})
