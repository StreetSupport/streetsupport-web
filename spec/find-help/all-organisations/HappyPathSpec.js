/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')

const ajax = require('../../../src/js/get-api-data')
const browser = require('../../../src/js/browser')
const endpoints = require('../../../src/js/api')
const location = require('../../../src/js/location/locationSelector')
const Model = require('../../../src/js/models/all-organisations/listing')
const spLocationData = require('./spLocationData')

describe('all organisations', () => {
  const locationResult = {
    'id': 'my-location',
    'findHelpId': 'my-location',
    'name': 'my selected postcode',
    'longitude': 123.4,
    'latitude': 567.8,
    'isPublic': true,
    'isSelectableInBody': false,
    'postcode': 'M1 2HX'
  }

  let ajaxStub = null
  let browserLoadingStub = null
  let browserLoadedStub = null

  let sut = null

  beforeEach(() => {
    sinon.stub(location, 'getPreviouslySetPostcode')
      .returns({
        then: (success) => {
          success(locationResult)
        }
      })

    ajaxStub = sinon.stub(ajax, 'data')
    ajaxStub
      .withArgs(`${endpoints.serviceProviderLocations}?pageSize=1000&latitude=${locationResult.latitude}&longitude=${locationResult.longitude}&range=10000`)
      .returns({
        then: (success) => {
          success({
            'status': 'ok',
            'statusCode': 200,
            'data': spLocationData.page1
          })
        }
      })
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')

    sut = new Model()
  })

  afterEach(() => {
    ajax.data.restore()
    browser.loading.restore()
    browser.loaded.restore()
    location.getPreviouslySetPostcode.restore()
  })

  it('- should set postcode from location', () => {
    expect(sut.postcode()).toEqual(locationResult.postcode)
  })

  it('- should notify user it is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
  })

  it('- should load data', () => {
    expect(ajaxStub.calledAfter(browserLoadingStub)).toBeTruthy()
  })

  it('- should set hasOrgs to true', () => {
    expect(sut.hasOrgs()).toBeTruthy()
  })

  it('- should display first eight orgs', () => {
    expect(sut.orgsToDisplay().length).toEqual(8)
    expect(sut.orgsToDisplay()[0].key).toEqual('streets-ahead')
  })

  it('- should group results by service provider', () => {
    const org = sut.organisations()
      .filter((o) => o.key === spLocationData.page1.items[0].serviceProviderKey)
    expect(org.length).toEqual(1)
  })

  it('- should map org locations', () => {
    const org = sut.organisations()
      .find((o) => o.key === spLocationData.page1.items[0].serviceProviderKey)
    expect(org.locations.length).toEqual(3)
  })

  it('- should map href', () => {
    const orgKey = spLocationData.page1.items[0].serviceProviderKey
    const org = sut.organisations()
      .find((o) => o.key === orgKey)
    expect(org.href).toEqual(`/find-help/organisation?organisation=${orgKey}`)
  })

  it('- should map org name', () => {
    const org = sut.organisations()
      .find((o) => o.key === 'st-ann39s-church')
    expect(org.name).toEqual('St Ann\'s Church')
  })

  it('- should assign distance in metres of nearest location', () => {
    const org = sut.organisations()
      .find((o) => o.key === 'rise-manchester')
    expect(org.distanceInMetres).toEqual(9592950)
  })

  it('- should assign distance away description of nearest location', () => {
    const org = sut.organisations()
      .find((o) => o.key === 'rise-manchester')
    expect(org.distanceDescription).toEqual('9592.95 km away')
  })

  it('- should set client groups', () => {
    const org = sut.organisations()[0]
    expect(org.clientGroupKeys).toEqual(['cg-1', 'cg-2'])
  })

  it('- should notify user it has loaded', () => {
    expect(browserLoadedStub.calledAfter(ajaxStub)).toBeTruthy()
  })

  describe('- pagination', () => {
    beforeEach(() => {
      sut.nextPage()
    })

    it('- should display next eight orgs', () => {
      expect(sut.orgsToDisplay()[sut.pageSize].key).toEqual('nacro-housing-services')
    })

    it('- should show prev page button', () => {
      expect(sut.hasPrevPages()).toBeTruthy()
    })

    it('- should show next page button', () => {
      expect(sut.hasMorePages()).toBeTruthy()
    })

    describe('- penultimate page', () => {
      beforeEach(() => {
        sut.nextPage()
        sut.nextPage()
        sut.nextPage()
        sut.nextPage()
      })

      it('- should show next page button', () => {
        expect(sut.hasMorePages()).toBeTruthy()
      })
    })

    it('- should show next page button', () => {
      expect(sut.hasMorePages()).toBeTruthy()
    })

    describe('- penultimate page', () => {
      beforeEach(() => {
        sut.nextPage()
        sut.nextPage()
        sut.nextPage()
        sut.nextPage()
      })

      it('- should show next page button', () => {
        expect(sut.hasMorePages()).toBeTruthy()
      })
    })

    describe('- no more items', () => {
      beforeEach(() => {
        for (let i = 2; i < Math.ceil(sut.organisations().length / sut.pageSize); i++) {
          sut.nextPage()
        }
      })

      it('- should hide next page button', () => {
        expect(sut.hasMorePages()).toBeFalsy()
      })
    })
  })

  describe('- sorting alphabetically', () => {
    beforeEach(() => {
      sut.sortAToZ()
    })

    it('- should sort orgs', () => {
      expect(sut.orgsToDisplay()[0].key).toEqual('albert-kennedy-trust')
    })

    it('- should set current sort to atoz', () => {
      expect(sut.isSortedAToZ()).toBeTruthy()
      expect(sut.isSortedNearest()).toBeFalsy()
    })
  })

  describe('- sorting by nearest', () => {
    beforeEach(() => {
      sut.sortNearest()
    })

    it('- should sort orgs', () => {
      expect(sut.orgsToDisplay()[0].key).toEqual('streets-ahead')
    })

    it('- should set current sort to nearest', () => {
      expect(sut.isSortedAToZ()).toBeFalsy()
      expect(sut.isSortedNearest()).toBeTruthy()
    })
  })

  describe('- search', () => {
    describe('- start of string', () => {
      beforeEach(() => {
        ajaxStub
          .withArgs(`${endpoints.serviceProviderLocations}?providerName=coffee`)
          .returns({
            then: (success) => {
              success({
                'status': 'ok',
                'statusCode': 200,
                'data': spLocationData.coffee
              })
            }
          })

        sut.searchQuery('coffee')
        sut.search()
      })

      it('- should filter by search query', () => {
        expect(sut.orgsToDisplay().length).toEqual(1)
        expect(sut.orgsToDisplay()[0].key).toEqual('coffee4craig')
      })
    })

    describe('- client group filters', () => {
      it('- should list available filters', () => {
        expect(sut.clientGroupFilters().length).toEqual(4)
      })

      describe('- filtering', () => {
        beforeEach(() => {
          sut.clientGroupFilters().find((cgf) => cgf.key === 'cg-3').click()
        })

        it('- should filter displayed orgs to only those with matching client group', () => {
          expect(sut.orgsToDisplay().length).toEqual(2)
        })

        describe('- with multiple', () => {
          let filterToToggle

          beforeEach(() => {
            filterToToggle = sut.clientGroupFilters().find((cgf) => cgf.key === 'cg-4')
            filterToToggle.click()
          })

          it('- should mark filter as selected', () => {
            expect(filterToToggle.isSelected()).toBeTruthy()
          })

          it('- should filter displayed orgs to only those with matching client group', () => {
            expect(sut.orgsToDisplay().length).toEqual(1)
          })

          describe('- toggle off', () => {
            beforeEach(() => {
              filterToToggle.click()
            })

            it('- should filter displayed orgs to only those with matching client group', () => {
              expect(sut.orgsToDisplay().length).toEqual(2)
            })

            it('- should un-mark filter as selected', () => {
              expect(filterToToggle.isSelected()).toBeFalsy()
            })
          })
        })
      })
    })

    describe('- enter new postcode', () => {
      let setPostcodeStub = null
      let setPostcodeArgs = null

      beforeEach(() => {
        ajaxStub.reset()
        browserLoadingStub.reset()
        browserLoadedStub.reset()
        setPostcodeStub = sinon.stub(location, 'setPostcode')

        sut.postcode('new postcode')
        sut.getByPostcode()

        setPostcodeArgs = setPostcodeStub.getCalls()[0].args
        setPostcodeArgs[1](locationResult)
      })

      afterEach(() => {
        location.setPostcode.restore()
      })

      it('- should set new postcode', () => {
        expect(setPostcodeArgs[0]).toEqual('new postcode')
      })

      it('- should notify user it is loading', () => {
        expect(browserLoadingStub.calledOnce).toBeTruthy()
      })

      it('- should load data', () => {
        expect(ajaxStub.calledAfter(browserLoadingStub)).toBeTruthy()
      })

      it('- should notify user it has loaded', () => {
        expect(browserLoadedStub.calledAfter(ajaxStub)).toBeTruthy()
      })
    })
  })
})
