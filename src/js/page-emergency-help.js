import './common'

let browser = require('./browser')
let LocationSelector = require('./locationSelector')
let locationSelector = new LocationSelector()

locationSelector
  .getCurrent()
  .then((result) => {
    if (window.location.href.indexOf(result.id) === -1) {
      browser.redirect('/' + result.id + '/emergency-help/')
    }
  })
