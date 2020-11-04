import ko from 'knockout'
import { ParentScenario, Advice, FAQ } from '../../models/families/family-advice-helper'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')
const htmlEncode = require('htmlencode')
const SearchFamilyAdviceModule = require('../../pages/families/search-family-advice/search-family-advice')

function FamilyAdviceResult () {
  const self = this
  self.searchQueryInQuerystring = ko.observable(querystring.parameter('searchQuery'))
  self.searchFamilyAdvice = new SearchFamilyAdviceModule.SearchFamilyAdvice()
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

  self.searchFamilyAdvice.advice.subscribe(() => {
    if (!self.isInitedResults()) {
      self.isInitedResults(true)
      self.searchFamilyAdvice.searchQuery(htmlEncode.htmlDecode(self.searchQueryInQuerystring().trim()))
      self.results(self.searchFamilyAdvice.filteredAdvice())
      self.searchFamilyAdvice.searchQuery('')
      self.searchFamilyAdvice.showFilteredAdvice(false)
    }
  })

  self.redirectToAdvice = function (advice) {
    browser.redirect(advice.url())
  }

  self.getFAQs = function () {
    api
    .data(`${endpoints.faqs}?tags=families&pageSize=100000&index=0`)
    .then((result) => {
      self.faqs(result.data.items.map((x) => {
        return new FAQ({
          id: ko.observable(x.id),
          body: ko.observable(x.body),
          sortPosition: ko.observable(x.sortPosition),
          tags: ko.observableArray(x.tags),
          title: ko.observable(x.title),
          isSelected: ko.observable(false),
          parentScenarioId: ko.observable(x.parentScenarioId)
        }, self)
      }))
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
              body: ko.observable(p.body),
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
            body: ko.observable(x.body),
            parentScenarioId: ko.observable(x.parentScenarioId),
            sortPosition: ko.observable(x.sortPosition),
            tags: ko.observableArray(x.tags),
            title: ko.observable(x.title),
            isSelected: ko.observable(false),
            isParentScenario: ko.observable(false)
          }, self)
        }))

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
