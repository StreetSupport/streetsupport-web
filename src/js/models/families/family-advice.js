import ko from 'knockout'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')
const location = require('../../location/locationSelector')
const htmlEncode = require('htmlencode')

function FamilyAdvice () {
  const self = this
  const currentLocation = location.getCurrentHubFromCookies()
  const adviceIdInQuerystring = querystring.parameter('id')
  const parentScenarioKeyInQuerystring = querystring.parameter('parentScenarioKey')
  self.advice = ko.observable({})
  self.parentScenarios = ko.observableArray()
  self.adviceByParentScenario = ko.observableArray()
  self.hasParentScenarios = ko.computed(() => self.parentScenarios().length > 0, this)

  self.getAdvice = function () {
    browser.loading()
    if (parentScenarioKeyInQuerystring) {
      api
      .data(`${endpoints.faqs}?location=${currentLocation.id}&tags=families&pageSize=100000&index=0&parentScenarioKey=${parentScenarioKeyInQuerystring}`)
      .then((result) => {
        self.adviceByParentScenario(result.data.items.map((x) => {
          return {
            id: ko.observable(x.id),
            body: ko.observable(x.body),
            locationKey: ko.observable(x.locationKey),
            parentScenario: ko.observable(x.parentScenario),
            sortPosition: ko.observable(x.sortPosition),
            tags: ko.observableArray(x.tags),
            title: ko.observable(x.title),
            breadcrumbs: ko.observable(`Families > ${x.parentScenario ? x.parentScenario.name + ' > ' : ''}${x.title}`),
            isSelected: ko.observable(x.id === adviceIdInQuerystring)          
          }
        }))
        self.advice(self.adviceByParentScenario().filter((x) => x.id() === adviceIdInQuerystring)[0])
        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
    }
    else {
      api
      .data(`${endpoints.faqs}/${adviceIdInQuerystring}`)
      .then((result) => {
        self.advice({
          id: ko.observable(result.data.id),
          body: ko.observable(result.data.body),
          locationKey: ko.observable(result.data.locationKey),
          sortPosition: ko.observable(result.data.sortPosition),
          tags: ko.observableArray(result.data.tags),
          title: ko.observable(result.data.title),
          breadcrumbs: ko.observable(`Families > ${result.data.parentScenario ? result.data.parentScenario.name + ' > ' : ''}${result.data.title}`)
        })
        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
    }
  }

  self.getAdvice()
}

module.exports = FamilyAdvice
