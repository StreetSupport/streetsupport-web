import ko from 'knockout'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')

function FamilyAdvice () {
  const self = this
  const adviceIdInQuerystring = querystring.parameter('id')
  self.advice = ko.observable()

  self.getAdvice = function () {
    browser.loading()
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

  self.getAdvice()
}

module.exports = FamilyAdvice
