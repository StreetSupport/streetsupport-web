/* global describe, beforeEach, afterEach, it, expect */

const sinon = require('sinon')

const browser = require('../../../src/js/browser')
import { redirectTo } from '../../../src/js/navigation/location-redirector'

describe('Header City Selector - On Location Change', () => {
  let browserLocationStub = null
  let browserRedirectStub = null
  let browserReloadStub = null

  beforeEach(() => {
    browserLocationStub = sinon.stub(browser, 'location')
    browserRedirectStub = sinon.stub(browser, 'redirect')
    browserReloadStub = sinon.stub(browser, 'reload')
  })

  afterEach(() => {
    browser.location.restore()
    browser.redirect.restore()
    browser.reload.restore()
  })

  const tests = [
    {name: 'root to city', current: '/', reqCityId: 'leeds', expected: '/leeds/'},
    {name: 'city to root', current: '/leeds/', reqCityId: 'elsewhere', expected: '/'},
    {name: 'city to city', current: '/leeds/', reqCityId: 'manchester', expected: '/manchester/'},
    {name: 'generic emergency help to city', current: '/find-help/emergency-help/', reqCityId: 'leeds', expected: '/leeds/emergency-help/'},
    {name: 'city emergency help to generic', current: '/leeds/emergency-help/', reqCityId: 'elsewhere', expected: '/find-help/emergency-help/'},
    {name: 'city emergency help to city', current: '/leeds/emergency-help/', reqCityId: 'manchester', expected: '/manchester/emergency-help/'},
    {name: 'generic severe weather to city', current: '/find-help/severe-weather-accommodation/', reqCityId: 'leeds', expected: '/leeds/severe-weather-accommodation/'},
    {name: 'city severe weather to generic', current: '/leeds/severe-weather-accommodation/', reqCityId: 'elsewhere', expected: '/find-help/severe-weather-accommodation/'},
    {name: 'city severe weather to city', current: '/leeds/severe-weather-accommodation/', reqCityId: 'manchester', expected: '/manchester/severe-weather-accommodation/'},
    {name: 'manchester big change to root', current: '/manchester/bigchangemcr/', reqCityId: 'elsewhere', expected: '/'},
    {name: 'manchester big change to city', current: '/manchester/bigchangemcr/', reqCityId: 'leeds', expected: '/leeds/'},
    {name: 'manchester big change about to root', current: '/manchester/bigchangemcr/about/', reqCityId: 'elsewhere', expected: '/'},
    {name: 'manchester big change about to city', current: '/manchester/bigchangemcr/about/', reqCityId: 'leeds', expected: '/leeds/'},
    {name: 'manchester big change partners to root', current: '/manchester/bigchangemcr/partners/', reqCityId: 'elsewhere', expected: '/'},
    {name: 'manchester big change partners to city', current: '/manchester/bigchangemcr/partners/', reqCityId: 'leeds', expected: '/leeds/'}
  ]

  tests
    .forEach((t) => {
      describe(`- ${t.name}`, () => {
        beforeEach(() => {
          browserLocationStub.returns({
            pathname: t.current
          })
          redirectTo(t.reqCityId)
        })

        it('', () => {
          expect(browserRedirectStub.withArgs(t.expected).calledOnce).toBeTruthy()
        })
      })
    })

  describe('- page handles location', () => {
    beforeEach(() => {
      browserLocationStub.returns({
        pathname: '/find-help/category/'
      })
      redirectTo('elsewhere')
    })
    it('- should not redirect', () => {
      expect(browserRedirectStub.called).toBeFalsy()
    })
    it('- should reload the page', () => {
      expect(browserReloadStub.calledOnce).toBeTruthy()
    })
  })
})
