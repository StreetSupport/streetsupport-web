// Common modules
import '../../../common'

// Page modules
const ko = require('knockout')
const location = require('../../../location/locationSelector')
const Model = require('../../../models/BestPracticeAwardsEnquiries')

location.getCurrentHub()
  .then((result) => {
    if (result.id !== 'manchester') {
      location.setCurrent('manchester')
      browser.reload()
    }
  })

ko.applyBindings(new Model())
