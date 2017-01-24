import './common'
const browser = require('./browser')
const endpoints = require('./api')
const api = require('./get-api-data')
var ko = require('knockout')
const marked = require('marked')
const htmlencode = require('htmlencode')

const Model = function () {
  const self = this

  self.totalServiceProviders = ko.observable()
  self.totalServices = ko.observable()
  self.totalVolunteers = ko.observable()
  self.totalNeeds = ko.observable()
  self.totalNeedResponses = ko.observable()
  self.totalPledges = ko.observable()
  self.totalOffers = ko.observable()
  self.pageViews = ko.observable()
  self.uniquePageViews = ko.observable()
  self.impactUpdates = ko.observableArray()
  self.shouldShowLoadMoreUpdates = ko.observable(false)

  const onError = () => {
    browser.redirect('/500')
  }

  const loadStatistics = () => {
    api
      .data(`${endpoints.statistics}/latest`)
      .then((result) => {
        self.totalServiceProviders(result.data.totalServiceProviders)
        self.totalServices(result.data.totalServices)
        self.totalVolunteers(result.data.totalVolunteers)
        self.totalNeeds(result.data.totalNeeds)
        self.totalNeedResponses(result.data.totalNeedResponses)
        self.totalPledges(result.data.totalPledges)
        self.totalOffers(result.data.totalOffers)
      }, onError)
  }

  const loadImpactUpdates = (url = endpoints.impactUpdates) => {
    api
      .data(url)
      .then((result) => {
        const newUpdates = result.data.embedded.items
          .map((u) => {
            u.city = `${u.cityId.charAt(0).toUpperCase()}${u.cityId.substring(1)}`
            u.contentForDisplay = marked(htmlencode.htmlDecode(u.content))
            return u
          })
        self.impactUpdates([...newUpdates, ...self.impactUpdates])
        self.shouldShowLoadMoreUpdates(result.data.links.next)
      }, onError)
  }

  const loadAnalytics = (url = `${endpoints.analyticsSnapshot}latest`) => {
    api
      .data(url)
      .then((result) => {
        self.pageViews(result.data.pageViews)
        self.uniquePageViews(result.data.uniquePageViews)
      }, onError)
  }

  self.init = () => {
    browser.loaded()
    loadStatistics()
    loadImpactUpdates()
    loadAnalytics()
  }
}

const model = new Model()

ko.applyBindings(model)

model.init()
