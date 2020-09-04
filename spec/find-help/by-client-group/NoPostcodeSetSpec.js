// /* global describe, beforeEach, afterEach, it, expect */

// const sinon = require('sinon')
// const browser = require('../../../src/js/browser')
// const postcodeLookup = require('../../../src/js/location/postcodes')
// const storage = require('../../../src/js/storage')
// const querystring = require('../../../src/js/get-url-parameter')

// import { clientGroups } from '../../../src/data/generated/client-groups'
// import FindHelpByClientGroup from '../../../src/js/models/find-help/by-client-group/by-group'

// describe('Find Help by Client group - no postcode set', () => {
//   let sut,
//     postcodeLookupStub

//   beforeEach(() => {
//     sinon.stub(browser, 'location')
//       .returns({
//         pathname: '/find-help/group/families/'
//       })
//     sinon.stub(browser, 'pushHistory')
//     sinon.stub(browser, 'setOnHistoryPop')
//     postcodeLookupStub = sinon.stub(postcodeLookup, 'getCoords')
//     sinon.stub(querystring, 'parameter')
//     sinon.stub(storage, 'get').returns({})

//     sut = new FindHelpByClientGroup()
//   })

//   afterEach(() => {
//     browser.location.restore()
//     browser.pushHistory.restore()
//     browser.setOnHistoryPop.restore()
//     postcodeLookup.getCoords.restore()
//     querystring.parameter.restore()
//     storage.get.restore()
//   })

//   it('- should set client group key', () => {
//     const clientGroup = clientGroups.find((sc) => sc.key === 'families')
//     expect(sut.clientGroup.clientGroupKey).toEqual(clientGroup.key)
//   })

//   it('- should set proximity search range to 10k', () => {
//     expect(sut.proximitySearch.range()).toEqual(10000)
//   })

//   it('- should set postcode to empty', () => {
//     expect(sut.proximitySearch.postcode()).toEqual(undefined)
//   })

//   it('- should set hasItems to false', () => {
//     expect(sut.hasItems()).toBeFalsy()
//   })

//   describe('- search without postcode', () => {
//     beforeEach(() => {
//       sut.proximitySearch.search()
//     })

//     it('- should not attempt postcode lookup', () => {
//       expect(postcodeLookupStub.notCalled).toBeTruthy()
//     })
//   })
// })
