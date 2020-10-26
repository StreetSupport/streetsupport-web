import ko from 'knockout'

const api = require('../../../get-api-data')
const browser = require('../../../browser')
const endpoints = require('../../../api')

class SearchAdviceBaseModel {
  constructor (data) {
    this.id = data.id
    this.title = data.title
    this.body = data.body
    this.sortPosition = data.sortPosition
    this.tags = data.tags
    this.breadcrumbs = data.breadcrumbs
    this.url = data.url
  }
}
class SearchParentScenarioModel extends SearchAdviceBaseModel {
  constructor (data) {
    super(data)
    this.parentScenario = ko.observable(null)
  }
}

class SearchAdviceModel extends SearchAdviceBaseModel {
  constructor (data) {
    super(data)
    this.parentScenario = data.parentScenario
  }
}

function SearchFamilyAdvice () {
  const self = this
  self.isSelectedSearchInput = ko.observable(false)
  self.showFilteredAdvice = ko.observable(false)
  self.advice = ko.observableArray([])
  self.filteredAdvice = ko.observableArray([])
  self.searchQuery = ko.observable('')
  self.parentScenarios = ko.observableArray()

  self.isSelectedSearchInput.subscribe((newValue) => {
    if (newValue && self.searchQuery().trim().length && self.filteredAdvice().length) {
      self.showFilteredAdvice(true)
    }
  })

  self.onInputLostFocus = function (data, event) {
    if (event.relatedTarget === null || event.relatedTarget != null && event.relatedTarget.className !== 'breadcrumbs-list') {
      self.showFilteredAdvice(false)
    }
  }

  self.searchQuery.subscribe(() => {
    self.search()
  })

  self.getAdvice = function () {
    api
    .data(`${endpoints.contentPages}?tags=families&type=advice&pageSize=100000&index=0`)
    .then((result) => {
      self.advice(result.data.items.map((x) => {
        let parentScenario = self.parentScenarios().filter((y) => y.id() === x.parentScenarioId)[0]
        return new SearchAdviceModel ({
          id: ko.observable(x.id),
          body: ko.observable(x.body),
          parentScenario: ko.observable(parentScenario),
          sortPosition: ko.observable(x.sortPosition),
          tags: ko.observableArray(x.tags),
          title: ko.observable(x.title),
          breadcrumbs: ko.observable(`Families > ${parentScenario ? parentScenario.title() + ' > ' : ''}${x.title}`),
          url: ko.observable(`/families/advice?id=${x.id}${parentScenario ? '&parentScenarioId=' + parentScenario.id() : ''}`)
        })
      }))
      self.advice(self.advice().concat(self.parentScenarios()))
      browser.loaded()
    }, (_) => {
      browser.redirect('/500')
    })
  }

  self.getParentScenarios = () => {
    browser.loading()
    api
      .data(`${endpoints.parentScenarios}`)
      .then((result) => {
        self.parentScenarios(result.data.map((x) => {
          return new SearchParentScenarioModel ({
            id: ko.observable(x.id),
            body: ko.observable(x.body),
            sortPosition: ko.observable(x.sortPosition),
            tags: ko.observableArray(x.tags),
            title: ko.observable(x.name),
            breadcrumbs: ko.observable(`Families > ${x.name}`),
            url: ko.observable(`/families/advice?parentScenarioId=${x.id}`)
          })
        }))
        self.getAdvice()
      }, () => {
        browser.redirect('/500')
      })
  }

  self.sortByTitle = function (a, b, searchTermRegex) {
    let resA = a.title().toLowerCase().trim().match(searchTermRegex)
    resA = (resA !== null && resA !== undefined) ? resA.length : 0

    let resB = b.title().toLowerCase().trim().match(searchTermRegex)
    resB = (resB !== null && resB !== undefined) ? resB.length : 0

    if ((resB - resA) === 0) {
      return self.sortByParentScenario(a, b, searchTermRegex)
    }
    return resB - resA
  }

  self.filterByTitle = function (searchTermRegex, advice) {
    let filteredByTitle = ko.observableArray(advice.filter((x) => {
      let result = x.title().toLowerCase().trim().match(searchTermRegex)
      return (result !== null && result !== undefined) && result.length
    }).sort((a, b) => self.sortByTitle(a, b, searchTermRegex)))

    return filteredByTitle
  }

  self.sortByParentScenario = function (a, b, searchTermRegex) {
    let resA = (a.parentScenario() !== null && a.parentScenario() !== undefined) ? a.parentScenario().title().toLowerCase().trim().match(searchTermRegex) : null
    resA = (resA !== null && resA !== undefined) ? resA.length : 0

    let resB = (b.parentScenario() !== null && b.parentScenario() !== undefined) ? b.parentScenario().title().toLowerCase().trim().match(searchTermRegex) : null
    resB = (resB !== null && resA !== undefined) ? resB.length : 0

    if ((resB - resA) === 0) {
      return self.sortByTag(a, b, searchTermRegex)
    }
    return resB - resA
  }

  self.filterByParentScenario = function (searchTermRegex, filteredAdvice) {
    let filteredByTitle = ko.observableArray(filteredAdvice.filter((x) => {
      if (x.parentScenario() !== null && x.parentScenario() !== undefined) {
        let result = x.parentScenario().title().toLowerCase().trim().match(searchTermRegex)
        return (result !== null && result !== undefined) && result.length
      }
      return false
    }).sort((a, b) => self.sortByParentScenario(a, b, searchTermRegex)))

    return filteredByTitle
  }

  self.sortByTag = function (a, b, searchTermRegex) {
    const searchRegExp = new RegExp('-', 'g')

    let resA = (a.tags() !== null && a.tags() !== undefined) ? a.tags().filter((y) => y !== 'families').join(' ').replace(searchRegExp, ' ').match(searchTermRegex) : null
    resA = (resA !== null && resA !== undefined) ? resA.length : 0

    let resB = (b.tags() !== null && b.tags() !== undefined) ? b.tags().filter((y) => y !== 'families').join(' ').replace(searchRegExp, ' ').match(searchTermRegex) : null
    resB = (resB !== null && resB !== undefined) ? resB.length : 0

    if ((resB - resA) === 0) {
      return self.sortByContent(a, b, searchTermRegex)
    }
    return resB - resA
  }

  self.filterByTag = function (searchTermRegex, filteredAdvice) {
    let filteredByTag = ko.observableArray(filteredAdvice.filter((x) => {
      if (x.tags() !== null && x.tags() !== undefined) {
        const searchRegExp = new RegExp('-', 'g')
        let result = x.tags().filter((y) => y !== 'families').join(' ').replace(searchRegExp, ' ').match(searchTermRegex)
        return (result !== null && result !== undefined) && result.length
      }
      return false
    }).sort((a, b) => self.sortByTag(a, b, searchTermRegex)))

    return filteredByTag
  }

  self.sortByContent = function (a, b, searchTermRegex) {
    let resContentA = a.body().toLowerCase().trim().match(searchTermRegex)
    resContentA = (resContentA !== null && resContentA !== undefined) ? resContentA.length : 0

    let resContentB = b.body().toLowerCase().trim().match(searchTermRegex)
    resContentB = (resContentB !== null && resContentB !== undefined) ? resContentB.length : 0

    return resContentB - resContentA
  }

  self.filterByContent = function (searchTermRegex, filteredAdvice) {
    let filteredByContent = ko.observableArray(filteredAdvice.filter((x) => {
      let result = x.body().toLowerCase().trim().match(searchTermRegex)
      return (result !== null && result !== undefined) && result.length
    }).sort((a, b) => self.sortByContent(a, b, searchTermRegex)))

    return filteredByContent
  }

  self.search = function () {
    let searchTerm = self.searchQuery().toLowerCase()

    if (searchTerm.trim()) {
      // Tokenize the search terms and remove empty spaces
      let tokens = searchTerm.toLowerCase().split(' ').filter((token) => token.trim() !== '')
      let searchTermRegex = new RegExp(tokens.join('|'), 'gim')

      let filteredByTitle = self.filterByTitle(searchTermRegex, self.advice())
      self.filteredAdvice(self.advice().filter((x) => !filteredByTitle().some((y) => x.id() === y.id())))

      let filteredByParentScenario = self.filterByParentScenario(searchTermRegex, self.filteredAdvice())
      self.filteredAdvice(self.filteredAdvice().filter((x) => !filteredByParentScenario().some((y) => x.id() === y.id())))

      let filteredByTag = self.filterByTag(searchTermRegex, self.filteredAdvice())
      self.filteredAdvice(self.filteredAdvice().filter((x) => !filteredByTag().some((y) => x.id() === y.id())))

      let filteredByContent = self.filterByContent(searchTermRegex, self.filteredAdvice())
      self.filteredAdvice(filteredByTitle().concat(filteredByParentScenario()).concat(filteredByTag()).concat(filteredByContent()))
    } else {
      self.filteredAdvice([])
    }

    self.showFilteredAdvice(self.filteredAdvice().length)
  }

  self.searchAll = function (data, event) {
    if (event.which === 1 || event.which === 13) {
      document.location.href = `/families/advice/result?searchQuery=${self.searchQuery().trim()}`
    }
  }

  self.getParentScenarios()
}

module.exports = SearchFamilyAdvice
