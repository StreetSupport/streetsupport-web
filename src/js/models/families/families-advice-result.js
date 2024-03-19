import ko from 'knockout'
import { ParentScenario, Advice, FAQ } from '../../models/families/families-advice-helper'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')
const marked = require('marked')
const htmlEncode = require('htmlencode')
const SearchFamiliesAdviceModule = require('../../pages/families/search-families-advice/search-families-advice')

function FamilyAdviceResult () {
  const self = this
  self.searchQueryInQuerystring = ko.observable(querystring.parameter('searchQuery'))
  self.searchFamiliesAdvice = new SearchFamiliesAdviceModule.SearchFamiliesAdvice()
  self.faqs = ko.observableArray([])
  self.hasFAQs = ko.computed(() => self.faqs().length > 0, this)
  self.currentParentScenario = ko.observable()
  self.parentScenarios = ko.observableArray([])
  self.adviceByParentScenario = ko.observableArray([])
  self.hasParentScenarios = ko.computed(() => self.parentScenarios().length > 0, this)
  self.hasAdvice = ko.computed(() => self.adviceByParentScenario().length > 0, this)
  self.isInitedResults = ko.observable(false)
  self.results = ko.observableArray([])
  self.isCollapsed = ko.observable(false)

  self.collapseMobileFilters = function () {
    self.isCollapsed(!self.isCollapsed())
  }

  self.searchFamiliesAdvice.advice.subscribe(() => {
    if (!self.isInitedResults()) {
      self.isInitedResults(true)
      self.searchFamiliesAdvice.searchQuery(htmlEncode.htmlDecode(self.searchQueryInQuerystring().trim()))
      self.results(self.searchFamiliesAdvice.filteredAdvice())
      self.searchFamiliesAdvice.searchQuery('')
      self.searchFamiliesAdvice.showFilteredAdvice(false)
    }
  })

  self.redirectToAdvice = function (advice) {
    browser.redirect(advice.url())
  }

  self.getFAQs = function () {
    api
      .data(`${endpoints.faqs}?tags=families&pageSize=100000&index=0&searchTerm=${self.searchQueryInQuerystring()}`)
      .then((result) => {
        self.faqs(result.data.items.map((x) => {
          return new FAQ({
            id: ko.observable(x.id),
            body: ko.observable(marked(htmlEncode.htmlDecode(x.body))),
            sortPosition: ko.observable(x.sortPosition),
            tags: ko.observableArray(x.tags),
            title: ko.observable(htmlEncode.htmlDecode(x.title)),
            isSelected: ko.observable(false),
            parentScenarioIds: ko.observableArray(x.parentScenarioIds)
          }, self)
        }).sort((a, b) => { return b.sortPosition() - a.sortPosition() }))
      }, (_) => {
        browser.redirect('/500')
      })
  }

  self.getParentScenarios = () => {
    browser.loading()
    api
      .data(`${endpoints.parentScenarios}?tags=families`)
      .then((result) => {
        self.parentScenarios(result.data
          .map(p => {
            return new ParentScenario({
              id: ko.observable(p.id),
              title: ko.observable(htmlEncode.htmlDecode(p.name)),
              body: ko.observable(marked(htmlEncode.htmlDecode(p.body))),
              sortPosition: ko.observable(p.sortPosition),
              tags: ko.observableArray(p.tags),
              isSelected: ko.observable(false),
              isParentScenario: ko.observable(true),
              isCurrentParentScenario: ko.observable(false)
            }, self)
          })
        )
        self.getFAQs()
        browser.loaded()
      }, () => {
        browser.redirect('/500')
      })
  }

  self.getAdvice = function () {
    browser.loading()
    if (self.currentParentScenario()) {
      self.adviceByParentScenario([])
      api
        .data(`${endpoints.contentPages}?tags=families&type=advice&pageSize=100000&index=0&parentScenarioId=${self.currentParentScenario().id()}`)
        .then((result) => {
          self.adviceByParentScenario(result.data.items.map((x) => {
            return new Advice({
              id: ko.observable(x.id),
              body: ko.observable(marked(htmlEncode.htmlDecode(x.body))),
              parentScenarioId: ko.observable(x.parentScenarioId),
              sortPosition: ko.observable(x.sortPosition),
              tags: ko.observableArray(x.tags),
              title: ko.observable(htmlEncode.htmlDecode(x.title)),
              isSelected: ko.observable(false),
              isParentScenario: ko.observable(false)
            }, self)
          }))

          if (!self.hasAdvice()) {
            browser.redirect(`/families/advice/?parentScenarioId=${self.currentParentScenario().id()}`)
          }

          browser.loaded()
        }, (_) => {
          browser.redirect('/500')
        })
    } else {
      browser.redirect('/500')
    }
  }

  self.getParentScenarios()
}

module.exports = FamilyAdviceResult
