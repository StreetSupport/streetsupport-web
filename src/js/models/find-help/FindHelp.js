import ko from 'knockout'

import FindHelpCategory from './FindHelpCategory'
import pushHistory from '../../history'
import ProximitySearch from '../ProximitySearch'

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
    pushHistory([
      { qsKey: 'postcode', getValue: () => this.proximitySearch.postcode() },
      ...this.filters
    ])
  }
}
