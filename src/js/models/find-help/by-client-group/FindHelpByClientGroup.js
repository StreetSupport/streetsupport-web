import ko from 'knockout'

import pushHistory from '../../../history'
import ProximitySearch from '../../ProximitySearch'
const querystring = require('../../../get-url-parameter')

export default class FindHelpByClientGroup {
  constructor () {
    // this.filters = filters
    this.clientGroup = new FindHelpClientGroup()
    this.proximitySearch = new ProximitySearch(this)

    this.items = ko.observableArray([])
    this.hasItems = ko.computed(() => this.items().length > 0, this)

    // this.listingHref = ko.observable()
    // this.timetableHref = ko.observable()
    // this.mapHref = ko.observable()
  }

  onProximitySearchFail () {
    window.alert('Sorry, your postcode could not be found. Please try a different, nearby postcode. Alternatively, you can use just the first portion eg: "M1".')
  }

  pushHistory () {
    pushHistory([
      // { qsKey: 'key', getValue: () => querystring.parameter('key') },
      { qsKey: 'postcode', getValue: () => this.proximitySearch.postcode() }
    ])
  }
}
