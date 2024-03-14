import ko from 'knockout'
import pushHistory from '../../history'
import { Guide } from './families-advice-helper'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')
const marked = require('marked')
const htmlEncode = require('htmlencode')
const SearchFamiliesAdviceModule = require('../../pages/families/search-families-advice/search-families-advice')

function FamiliesGuides () {
  const self = this
  self.guideIdInQuerystring = ko.observable(querystring.parameter('id'))
  self.searchFamiliesAdvice = new SearchFamiliesAdviceModule.SearchFamiliesAdvice()
  self.guides = ko.observableArray([])
  self.hasGuides = ko.computed(() => self.guides().length > 0, this)

  self.pushHistory = function () {
    const filters = [{ qsKey: 'id', getValue: () => self.guideIdInQuerystring() }]
    pushHistory(filters)
  }

  self.onBrowserHistoryBack = function () {
    if (querystring.parameter('id')) {
      self.guides().filter(x => x.id() === querystring.parameter('id'))[0].toggle(true)
    } else {
      self.guides().forEach(x => {
        x.isSelected(false)
        x.isExpanded(false)
      })
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
          return new Guide({
            id: ko.observable(x.id),
            sortPosition: ko.observable(x.sortPosition),
            title: ko.observable(htmlEncode.htmlDecode(x.title)),
            body: ko.observable(marked(htmlEncode.htmlDecode(x.body))),
            isSelected: ko.observable(self.guideIdInQuerystring() ? self.guideIdInQuerystring() === x.id : false),
            isExpanded: ko.observable(false),
            files: ko.observable(x.files.map(item => {
              return {
                name: item.fileName,
                url: `${endpoints.contentPages}/file/${item.fileId}`
              }
            }))
          }, self)
        }).sort((a, b) => { return b.sortPosition() - a.sortPosition() }))
        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  self.getGuides()
}

module.exports = FamiliesGuides
