import ko from 'knockout'
import pushHistory from '../../../history'
import ProximitySearch from '../../ProximitySearch'
import FindHelpClientGroup from './FindHelpClientGroup'

export default class FindHelp {
  constructor (filters = []) {
    this.filters = filters
    this.clientGroup = new FindHelpClientGroup()
    this.proximitySearch = new ProximitySearch(this)

    this.items = ko.observableArray([])
    this.hasItems = ko.computed(() => this.items().length > 0, this)
  }

  encodeClientGroupKey (key) {
    if (key.charAt(key.length - 1) === '+') {
      return key.slice(0, -1) + '%2B'
    }
    return key
  }

  onProximitySearchFail () {
    window.alert('Sorry, your postcode could not be found. Please try a different, nearby postcode. Alternatively, you can use just the first portion eg: "M1".')
  }

  pushHistory () {
    pushHistory([
      { qsKey: 'postcode', getValue: () => this.proximitySearch.postcode() },
      ...this.filters
    ])
  }
}
