import ko from 'knockout'
import pushHistory from '../../history'
import { ParentScenario, Advice } from './families-advice-helper'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')
const htmlEncode = require('htmlencode')
const SearchFamiliesAdviceModule = require('../../pages/families/search-families-advice/search-families-advice')

function Families () {
  const self = this
  self.parentScenarioIdInQuerystring = ko.observable(querystring.parameter('parentScenarioId'))
  self.searchFamiliesAdvice = new SearchFamiliesAdviceModule.SearchFamiliesAdvice()
  self.currentParentScenario = ko.observable()
  self.parentScenarios = ko.observableArray([])
  self.adviceByParentScenario = ko.observableArray([])
  self.guides = ko.observableArray([])
  self.hasParentScenarios = ko.computed(() => self.parentScenarios().length > 0, this)
  self.hasAdvice = ko.computed(() => self.adviceByParentScenario().length > 0, this)
  self.hasGuides = ko.computed(() => self.guides().length > 0, this)

  self.redirectToSupport = function () {
    browser.redirect('https://streetsupport.net/')
  }

  self.redirectToAdvice = function (advice) {
    browser.redirect(`/families/advice/?id=${advice.id()}&parentScenarioId=${advice.parentScenarioId()}`)
  }

  self.currentParentScenario.subscribe((newValue) => {
    if (newValue) {
      self.parentScenarioIdInQuerystring(newValue.id())
      self.pushHistory()
    }
  })

  self.pushHistory = function () {
    let filters = [{ qsKey: 'parentScenarioId', getValue: () => self.parentScenarioIdInQuerystring() }]
    pushHistory(filters)
  }

  self.onBrowserHistoryBack = function () {
    if (self.parentScenarioIdInQuerystring() || self.currentParentScenario()) {
      self.parentScenarioIdInQuerystring('')
      self.currentParentScenario(undefined)
    }
  }

  browser.setOnHistoryPop((e) => {
    self.onBrowserHistoryBack()
  })

  self.getGuides = function () {
    browser.loading()
    api
    .data(`${endpoints.contentPages}?tags=families&type=guides&pageSize=100000&index=0`)
    .then((result) => {
      self.guides(result.data.items.map((x) => {
        return {
          id: ko.observable(x.id),
          sortPosition: ko.observable(x.sortPosition),
          title: ko.observable(htmlEncode.htmlDecode(x.title))
        }
      }).sort((a, b) => { return b.sortPosition() - a.sortPosition() }))

      browser.loaded()
    }, (_) => {
      browser.redirect('/500')
    })
  }

  self.getAdvice = function () {
    browser.loading()
    if (self.parentScenarioIdInQuerystring()) {
      self.adviceByParentScenario([])
      api
      .data(`${endpoints.contentPages}?tags=families&type=advice&pageSize=100000&index=0&parentScenarioId=${self.parentScenarioIdInQuerystring()}`)
      .then((result) => {
        self.adviceByParentScenario(result.data.items.map((x) => {
          return new Advice({
            id: ko.observable(x.id),
            body: ko.observable(htmlEncode.htmlDecode(x.body)),
            parentScenarioId: ko.observable(x.parentScenarioId),
            sortPosition: ko.observable(x.sortPosition),
            tags: ko.observableArray(x.tags),
            title: ko.observable(htmlEncode.htmlDecode(x.title)),
            isSelected: ko.observable(false),
            isParentScenario: ko.observable(false)
          }, self)
        }).sort((a, b) => { return b.sortPosition() - a.sortPosition() }))

        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
    } else {
      browser.redirect('/500')
    }
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
              body: ko.observable(htmlEncode.htmlDecode(p.body)),
              sortPosition: ko.observable(p.sortPosition),
              tags: ko.observableArray(p.tags),
              isSelected: ko.observable(false),
              isParentScenario: ko.observable(true),
              isCurrentParentScenario: ko.observable(p.id === self.parentScenarioIdInQuerystring())
            }, self)
          }).sort((a, b) => { return b.sortPosition() - a.sortPosition() })
        )
        self.parentScenarios(self.parentScenarios().concat(self.parentScenarios()))
        self.currentParentScenario(self.parentScenarios().filter((x) => x.id() === self.parentScenarioIdInQuerystring())[0])
        if (self.currentParentScenario()) {         
          self.getAdvice()
        } else if (!self.currentParentScenario() && self.parentScenarioIdInQuerystring()) {
          browser.redirect('/500')
        }

        browser.loaded()
      }, () => {
        browser.redirect('/500')
      })
  }

  self.getParentScenarios()
  self.getGuides()
}

module.exports = Families
