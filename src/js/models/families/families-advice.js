import ko from 'knockout'
import pushHistory from '../../history'
import { ParentScenario, Advice, FAQ } from './families-advice-helper'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')
const marked = require('marked')
const htmlEncode = require('htmlencode')
const SearchFamiliesAdviceModule = require('../../pages/families/search-families-advice/search-families-advice')

function FamilyAdvice () {
  const self = this
  self.adviceIdInQuerystring = ko.observable(querystring.parameter('id'))
  self.parentScenarioIdInQuerystring = ko.observable(querystring.parameter('parentScenarioId'))

  self.searchFamiliesAdvice = new SearchFamiliesAdviceModule.SearchFamiliesAdvice()
  self.currentAdvice = ko.observable()
  self.currentParentScenario = ko.observable()
  self.parentScenarios = ko.observableArray([])
  self.adviceByParentScenario = ko.observableArray([])
  self.hasParentScenarios = ko.computed(() => self.parentScenarios().length > 0, this)
  self.hasAdvice = ko.computed(() => self.adviceByParentScenario().length > 0, this)
  self.faqs = ko.observableArray([])
  self.hasFAQs = ko.computed(() => self.faqs().length > 0, this)
  self.isCollapsed = ko.observable(false)

  self.collapseMobileFilters = function () {
    self.isCollapsed(!self.isCollapsed())
  }

  self.deactivateSelectedItems = function () {
    self.parentScenarios().forEach(element => {
      element.isSelected(false)
    })
    self.adviceByParentScenario().forEach(element => {
      element.isSelected(false)
    })
  }

  self.pushHistory = function () {
    const filters = []
    if (self.parentScenarioIdInQuerystring()) {
      filters.push({ qsKey: 'parentScenarioId', getValue: () => self.parentScenarioIdInQuerystring() },
        ...[{ qsKey: 'id', getValue: () => self.adviceIdInQuerystring() }])
    } else if (self.adviceIdInQuerystring()) {
      filters.push({ qsKey: 'id', getValue: () => self.adviceIdInQuerystring() },
        ...[{ qsKey: 'parentScenarioId', getValue: () => self.parentScenarioIdInQuerystring() }])
    }
    pushHistory(filters)
  }

  self.onBrowserHistoryBack = function (thisDoobrey, e) {
    if (querystring.parameter('parentScenarioId') && querystring.parameter('id')) {
      if (querystring.parameter('parentScenarioId') === self.currentParentScenario().id()) {
        self.adviceByParentScenario().filter(x => x.id() === querystring.parameter('id'))[0].changeAdvice(true)
      } else {
        self.adviceIdInQuerystring(querystring.parameter('id'))
        self.parentScenarios().filter(x => x.id() === querystring.parameter('parentScenarioId'))[0].changeParentScenario(true)
      }
    } else if (querystring.parameter('parentScenarioId') && !querystring.parameter('id')) {
      self.adviceIdInQuerystring('')
      self.parentScenarios().filter(x => x.id() === querystring.parameter('parentScenarioId'))[0].changeParentScenario(true)
    } else if (querystring.parameter('id') && !querystring.parameter('parentScenarioId')) {
      self.adviceIdInQuerystring(querystring.parameter('id'))
      self.parentScenarioIdInQuerystring('')
      self.getAdvice(true)
    }
  }

  browser.setOnHistoryPop((e) => {
    self.onBrowserHistoryBack()
  })

  self.currentParentScenario.subscribe(() => {
    self.getFAQs()
  })

  self.getAdvice = function (isBackUrl) {
    browser.loading()
    if (self.parentScenarioIdInQuerystring()) {
      self.adviceByParentScenario([])
      api
        .data(`${endpoints.contentPages}?tags=families&type=advice&pageSize=100000&index=0&parentScenarioId=${self.parentScenarioIdInQuerystring()}`)
        .then((result) => {
          self.adviceByParentScenario(result.data.items.map((x) => {
            return new Advice({
              id: ko.observable(x.id),
              body: ko.observable(marked(htmlEncode.htmlDecode(x.body))),
              parentScenarioId: ko.observable(x.parentScenarioId),
              sortPosition: ko.observable(x.sortPosition),
              tags: ko.observableArray(x.tags),
              title: ko.observable(htmlEncode.htmlDecode(x.title)),
              isSelected: ko.observable(x.id === self.adviceIdInQuerystring()),
              isParentScenario: ko.observable(false),
              files: ko.observable(x.files.map(item => {
                return {
                  name: item.fileName,
                  url: `${endpoints.contentPages}/file/${item.fileId}`
                }
              }))
            }, self)
          }).sort((a, b) => { return b.sortPosition() - a.sortPosition() }))

          if (self.adviceByParentScenario().filter((x) => x.id() === self.adviceIdInQuerystring()).length) {
            if (isBackUrl === true) {
              self.parentScenarios().forEach(element => {
                element.isSelected(false)
              })
            }
            self.currentAdvice(self.adviceByParentScenario().filter((x) => x.id() === self.adviceIdInQuerystring())[0])
          } else {
            // If we get wrong id in the url parameters we should clear it from url
            if (!self.currentAdvice() && self.adviceIdInQuerystring()) {
              self.adviceIdInQuerystring('')
              self.pushHistory()
            }
            self.currentAdvice(self.currentParentScenario())
            self.parentScenarios().filter((x) => x.id() === self.currentParentScenario().id())[0].isSelected(true)
          }

          browser.loaded()
        }, (_) => {
          browser.redirect('/500')
        })
    } else if (self.adviceIdInQuerystring()) {
      api
        .data(`${endpoints.contentPages}/${self.adviceIdInQuerystring()}`).then((result) => {
          if (isBackUrl === true) {
            self.deactivateSelectedItems()
            self.parentScenarios().forEach(element => {
              element.isCurrentParentScenario(false)
            })
          }
          self.currentAdvice(new Advice({
            id: ko.observable(result.data.id),
            title: ko.observable(htmlEncode.htmlDecode(result.data.title)),
            body: ko.observable(marked(htmlEncode.htmlDecode(result.data.body))),
            sortPosition: ko.observable(result.data.sortPosition),
            tags: ko.observableArray(result.data.tags),
            isSelected: ko.observable(true),
            isParentScenario: ko.observable(false),
            files: ko.observable(result.data.files.map(item => {
              return {
                name: item.fileName,
                url: `${endpoints.contentPages}/file/${item.fileId}`
              }
            }))
          }, self))

          self.getFAQs()
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
              body: ko.observable(marked(htmlEncode.htmlDecode(p.body))),
              sortPosition: ko.observable(p.sortPosition),
              tags: ko.observableArray(p.tags),
              isSelected: ko.observable(false),
              isParentScenario: ko.observable(true),
              isCurrentParentScenario: ko.observable(p.id === self.parentScenarioIdInQuerystring()),
              files: ko.observable([])
            }, self)
          }).sort((a, b) => { return b.sortPosition() - a.sortPosition() })
        )

        self.currentParentScenario(self.parentScenarios().filter((x) => x.id() === self.parentScenarioIdInQuerystring())[0])
        if (!self.currentParentScenario() && (!self.adviceIdInQuerystring() || self.parentScenarioIdInQuerystring())) {
          browser.redirect('/500')
        }

        browser.loaded()
        self.getAdvice()
      }, () => {
        browser.redirect('/500')
      })
  }

  self.getFAQs = function () {
    api
      .data(`${endpoints.faqs}?tags=families&pageSize=100000&index=0${self.parentScenarioIdInQuerystring() ? '&parentScenarioIds=' + self.parentScenarioIdInQuerystring() : ''}`)
      .then((result) => {
        self.faqs(result.data.items.map((x) => {
          return new FAQ({
            id: ko.observable(x.id),
            body: ko.observable(marked(htmlEncode.htmlDecode(x.body))),
            sortPosition: ko.observable(x.sortPosition),
            tags: ko.observableArray(x.tags),
            title: ko.observable(x.title),
            isSelected: ko.observable(false),
            parentScenarioIds: ko.observableArray(x.parentScenarioIds)
          }, self)
        }).sort((a, b) => { return b.sortPosition() - a.sortPosition() }))
      }, (_) => {
        browser.redirect('/500')
      })
  }

  self.getParentScenarios()
}

module.exports = FamilyAdvice
