import ko from 'knockout'
import { ParentScenario } from './families-advice-helper'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const marked = require('marked')
const htmlEncode = require('htmlencode')
const SearchFamiliesAdviceModule = require('../../pages/families/search-families-advice/search-families-advice')

function Families () {
  const self = this
  self.searchFamiliesAdvice = new SearchFamiliesAdviceModule.SearchFamiliesAdvice()
  self.parentScenarios = ko.observableArray([])
  self.guides = ko.observableArray([])
  self.hasParentScenarios = ko.computed(() => self.parentScenarios().length > 0, this)
  self.hasGuides = ko.computed(() => self.guides().length > 0, this)

  self.redirectToSupport = function () {
    browser.redirect('https://england.shelter.org.uk/housing_advice/homelessness/rules/emergency_housing_if_you_are_homeless')
  }

  self.redirectToParentScenario = function (parentScenario) {
    browser.redirect(`/families/advice/?parentScenarioId=${parentScenario.id()}`)
  }

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
              isParentScenario: ko.observable(true)
            }, self)
          }).sort((a, b) => { return b.sortPosition() - a.sortPosition() })
        )

        browser.loaded()
      }, () => {
        browser.redirect('/500')
      })
  }

  self.getParentScenarios()
  self.getGuides()
}

module.exports = Families
