import ko from 'knockout'

const browser = require('../../browser')
import FindHelpCategory from './FindHelpCategory'
import ProximitySearch from '../ProximitySearch'

const querystring = require('../../get-url-parameter')

export default class FindHelp {
  constructor (filters = []) {
    this.filters = filters
    this.category = new FindHelpCategory()
    this.proximitySearch = new ProximitySearch(this)

    this.items = ko.observableArray([])
    this.hasItems = ko.computed(() => this.items().length > 0, this)
  }

  onProximitySearchFail () {
    window.alert('Sorry, your postcode could not be found. Please try a different, nearby postcode. Alternatively, you can use just the first portion eg: "M1".')
  }

  pushHistory () {
    const getValues = (d) => {
      return {
        qsKey: d.qsKey,
        qsValue: querystring.parameter(d.qsKey),
        currentValue: d.getValue()
      }
    }

    const anyValueHasChanged = (filters) => {
      return filters
        .reduce((acc, next) => {
          return acc
            ? true
            : next.qsValue !== next.currentValue
        }, false)
    }

    const buildQuerystring = (kvps) => {
      return kvps
        .map((kv) => `${kv.qsKey}=${kv.currentValue}`)
        .join('&')
    }

    const buildHistory = (kvps) => {
      const history = {}
      kvps
        .forEach((kvp) => {
          history[kvp.qsKey] = kvp.currentValue
        })
      return history
    }

    const filters = [
      { qsKey: 'postcode', getValue: () => this.proximitySearch.postcode() },
      ...this.filters
    ]
      .map(getValues)

    if (anyValueHasChanged(filters)) {
      const kvps = filters
        .filter((kv) => kv.currentValue !== undefined)

      const newUrl = `?${buildQuerystring(kvps)}`
      browser.pushHistory(buildHistory(kvps), '', newUrl)
    }
  }
}
