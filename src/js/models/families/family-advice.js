import ko from 'knockout'
import pushHistory from '../../history'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')
const location = require('../../location/locationSelector')
const htmlEncode = require('htmlencode')
const SearchFamilyAdvice = require('../../pages/families/search-family-advice/search-family-advice')

class ParentScenario {
  constructor (data, container) {
    this.id = data.id
    this.name = data.name
    this.container = container
    this.isSelected = data.isSelected
  }

  changeParentScenario () {
    this.container.parentScenarios().forEach(element => {
      element.isSelected(false)
    });
    this.isSelected(true)
    this.container.parentScenarioIdInQuerystring(this.id())
    this.container.pushHistory()
    this.container.getAdvice()
  }
}

class Advice {
  constructor (data, container) {
    this.id = data.id
    this.title = data.title
    this.body = data.body
    this.locationKey = data.locationKey
    this.parentScenarioId = data.parentScenarioId
    this.sortPosition = data.sortPosition
    this.tags = data.tags
    this.isSelected = data.isSelected
    this.container = container
  }

  toggle () {
    this.isSelected(!this.isSelected())
  }

  changeAdvice () {
    debugger
    this.container.currentAdvice(this)
    this.container.adviceIdInQuerystring(this.container.currentAdvice().id())
    this.container.pushHistory()
  }
}

function FamilyAdvice () {
  const self = this
  const currentLocation = location.getCurrentHubFromCookies()
  self.adviceIdInQuerystring = ko.observable(querystring.parameter('id'))
  self.parentScenarioIdInQuerystring = ko.observable(querystring.parameter('parentScenarioId'))

  self.searchFamilyAdvice = new SearchFamilyAdvice()
  self.currentAdvice = ko.observable()
  self.currentParentScenario = ko.observable()
  self.parentScenarios = ko.observableArray()
  self.adviceByParentScenario = ko.observableArray()
  self.hasParentScenarios = ko.computed(() => self.parentScenarios().length > 0, this)
  self.hasAdvice = ko.computed(() => self.adviceByParentScenario().length > 0, this)

  self.pushHistory = function () {
    debugger
    pushHistory([
      { qsKey: 'id', getValue: () => self.adviceIdInQuerystring(),
        qsKey: 'parentScenarioId', getValue: () => self.parentScenarioIdInQuerystring() }
    ])
  }

  self.getAdvice = function () {
    browser.loading()
    if (self.parentScenarioIdInQuerystring()) {
      api
      .data(`${endpoints.faqs}?location=${currentLocation.id}&tags=families&pageSize=100000&index=0&parentScenarioId=${self.parentScenarioIdInQuerystring()}`)
      .then((result) => {
        self.adviceByParentScenario(result.data.items.map((x) => {
          return new Advice ({
            id: ko.observable(x.id),
            body: ko.observable(x.body),
            locationKey: ko.observable(x.locationKey),
            parentScenarioId: ko.observable(x.parentScenarioId),
            sortPosition: ko.observable(x.sortPosition),
            tags: ko.observableArray(x.tags),
            title: ko.observable(x.title),
            isSelected: ko.observable(x.id === self.adviceIdInQuerystring())
          } , self)
        }))

        debugger
        if (self.adviceByParentScenario().filter((x) => x.id() === self.adviceIdInQuerystring()).length) {
          self.currentAdvice(self.adviceByParentScenario().filter((x) => x.id() === self.adviceIdInQuerystring())[0])
        } else {
          self.currentAdvice(self.adviceByParentScenario()[0])
        }
        debugger
        self.adviceIdInQuerystring(self.currentAdvice().id())
        self.pushHistory()
        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
    } else {
      api
      .data(`${endpoints.faqs}/${self.adviceIdInQuerystring()}`).then((result) => {
        self.currentAdvice(new Advice ({
          id: ko.observable(result.data.id),
          body: ko.observable(result.data.body),
          locationKey: ko.observable(result.data.locationKey),
          sortPosition: ko.observable(result.data.sortPosition),
          tags: ko.observableArray(result.data.tags),
          title: ko.observable(result.data.title),
          isSelected: ko.observable(true)
        }, self))

        debugger
        self.adviceIdInQuerystring(self.currentAdvice().id())
        self.pushHistory()
        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
    }
  }

  self.getParentScenarios = () => {
    api
      .data(`${endpoints.parentScenarios}`)
      .then((result) => {
        self.parentScenarios(result.data
          .map(p => {
            return new ParentScenario ({
              id: ko.observable(p.id),
              name: ko.observable(htmlEncode.htmlDecode(p.name)),
              isSelected: ko.observable(p.id === self.parentScenarioIdInQuerystring())        
            }, self)
          })
        )
        self.currentParentScenario(self.parentScenarios().filter((x) => x.id() === self.parentScenarioIdInQuerystring())[0])
      }, () => {
        self.handleServerError()
      })
  }

  self.getAdvice()
  self.getParentScenarios()
}

module.exports = FamilyAdvice
