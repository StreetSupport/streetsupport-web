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
  self.hasParentScenarios = ko.computed(() => self.parentScenarios().length > 0, this)
  self.hasAdvice = ko.computed(() => self.adviceByParentScenario().length > 0, this)

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
              isCurrentParentScenario: ko.observable(p.id === self.parentScenarioIdInQuerystring())
            }, self)
          })
        )
        self.parentScenarios(self.parentScenarios().concat(self.parentScenarios()))

        self.currentParentScenario(self.parentScenarios().filter((x) => x.id() === self.parentScenarioIdInQuerystring())[0])
        if (!self.currentParentScenario() && self.parentScenarioIdInQuerystring()) {
          browser.redirect('/500')
        }

        browser.loaded()
      }, () => {
        browser.redirect('/500')
      })
  }

  self.getParentScenarios()
}

module.exports = Families
