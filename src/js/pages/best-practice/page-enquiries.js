import '../../common'

const ko = require('knockout')

const browser = require('../../browser')
const location = require('../../location/locationSelector')
const Model = require('../../models/BestPracticeEnquiries')

const currentLocation = location.getCurrentHub()
if (currentLocation.id !== 'manchester') {
  location.setCurrent('manchester')
  browser.reload()
}

ko.applyBindings(new Model())
