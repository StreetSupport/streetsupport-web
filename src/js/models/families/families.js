// Common modules
import '../../common'
import ko from 'knockout'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const location = require('../../location/locationSelector')

function Families () {
  const self = this
  const currentLocation = location.getCurrentHubFromCookies()

  self.isSelectedSearchInput = ko.observable(false)
  self.showFilteredAdvice = ko.observable(false)
  self.advice = ko.observableArray([])
  self.filteredAdvice = ko.observableArray([])
  self.searchQuery = ko.observable('')

  self.isSelectedSearchInput.subscribe((newValue) => {
    if (!newValue) {
      self.showFilteredAdvice(false)
    } else if (newValue && self.searchQuery().trim().length && self.filteredAdvice().length) {
      self.showFilteredAdvice(true)
    }
  })

  self.searchQuery.subscribe(() => {
    self.search()
  })

  self.getAdvice = function () {
    browser.loading()
    api
    .data(`${endpoints.faqs}?location=${currentLocation.id}&tags=families&pageSize=100000&index=0`)
    .then((result) => {
      self.advice(result.data.items.map((x) => {
        return {
          id: ko.observable(x.id),
          body: ko.observable(x.body),
          locationKey: ko.observable(x.locationKey),
          parentScenario: ko.observable(x.parentScenario),
          sortPosition: ko.observable(x.sortPosition),
          tags: ko.observableArray(x.tags),
          title: ko.observable(x.title),
          breadcrumbs: ko.observable(`Families > ${x.parentScenario ? x.parentScenario.name + ' > ' : ''}${x.title}`)
        }
      }))
      browser.loaded()
    }, (_) => {
      browser.redirect('/500')
    })
  }

  self.filterByTitle = function (searchTermRegex) {
    let filteredByTitle = ko.observableArray(self.advice().filter((x) => {
                                                                    let result = x.title().toLowerCase().trim().match(searchTermRegex);
                                                                    return result != null && result.length
                                                                  })
                            .sort((a, b) => b.title().toLowerCase().trim().match(searchTermRegex).length
                                          - a.title().toLowerCase().trim().match(searchTermRegex).length))
    return filteredByTitle
  }

  self.filterByTag = function (searchTermRegex) {
    let filteredByTag = ko.observableArray(self.filteredAdvice().filter((x) => {
                                                                          let result = x.tags().filter((y) => y !== 'families').join(' ').replaceAll('-', ' ').match(searchTermRegex)
                                                                          return result != null && result.length
                                                                        })
                          .sort((a, b) => b.tags().filter((y) => y !== 'families').join(' ').replaceAll('-', ' ').match(searchTermRegex).length
                                        - a.tags().filter((y) => y !== 'families').join(' ').match(searchTermRegex).length))
    return filteredByTag
  }

  self.filterByContent = function (searchTermRegex) {
    let filteredByContent = ko.observableArray(self.filteredAdvice().filter((x) => {
                                                                              let result = x.body().toLowerCase().trim().match(searchTermRegex)
                                                                              return result != null && result.length
                                                                            })
                              .sort((a, b) => b.body().toLowerCase().trim().match(searchTermRegex).length
                                            - a.body().toLowerCase().trim().match(searchTermRegex).length))
    return filteredByContent
  }

  self.search = function () {
    let searchTerm = self.searchQuery().toLowerCase()

    if (searchTerm.trim()) {
      // Tokenize the search terms and remove empty spaces
      let tokens = searchTerm.toLowerCase().split(' ').filter((token) => token.trim() !== '');
      let searchTermRegex = new RegExp(tokens.join('|'), 'gim')

      let filteredByTitle = self.filterByTitle(searchTermRegex)
      self.filteredAdvice(self.advice().filter((x) => !filteredByTitle().some((y) => x.id() === y.id()) ))

      let filteredByTag = self.filterByTag(searchTermRegex)
      self.filteredAdvice(self.filteredAdvice().filter((x) => !filteredByTag().some((y) => x.id() === y.id()) ))

      let filteredByContent = self.filterByContent(searchTermRegex)
      self.filteredAdvice(filteredByTitle().concat(filteredByTag()).concat(filteredByContent()))
    }
    else {
      self.filteredAdvice([])
    }

    self.showFilteredAdvice(self.filteredAdvice().length)
  }

  self.getAdvice()
}

module.exports = Families
