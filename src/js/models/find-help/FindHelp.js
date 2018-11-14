import ko from 'knockout'

const browser = require('../../browser')
import FindHelpCategory from './FindHelpCategory'
import ProximitySearch from '../ProximitySearch'

const querystring = require('../../get-url-parameter')

export default class FindHelp {
  constructor (filters = []) {
    this.filters = filters
    this.category = new FindHelpCategory()
    const postcodeInQuerystring = querystring.parameter('postcode')
    this.proximitySearch = new ProximitySearch(this, postcodeInQuerystring)

    this.items = ko.observableArray([])
    this.hasItems = ko.computed(() => this.items().length > 0, this)
  }

  onProximitySearchFail () {
    window.alert('Sorry, your postcode could not be found. Please try a different, nearby postcode. Alternatively, you can use just the first portion eg: "M1".')
  }

  pushHistory () {
    const doobies = [
      { qsKey: 'postcode', getValue: () => this.proximitySearch.postcode() },
      ...this.filters
    ]

    const mapped = doobies
      .map((d) => {
        return {
          qsKey: d.qsKey,
          qsValue: querystring.parameter(d.qsKey),
          currentValue: d.getValue()
        }
      })

    const valueHasChanged = mapped
      .reduce((acc, next) => {
        return acc
          ? true
          : next.qsValue !== next.currentValue
      }, false)

    if (valueHasChanged) {
      const kvps = mapped
        .filter((kv) => kv.currentValue !== undefined)

      const qs = kvps
        .map((kv) => `${kv.qsKey}=${kv.currentValue}`)
        .join('&')

      const history = {}
      kvps
        .forEach((kvp) => {
          history[kvp.qsKey] = kvp.currentValue
        })

      const newUrl = `?${qs}`
      browser.pushHistory(history, '', newUrl)
    }
  }
}
