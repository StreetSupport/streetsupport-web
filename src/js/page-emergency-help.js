import './common'

let browser = require('./browser')
let locationSelector = require('./location/locationSelector')

locationSelector
  .getCurrent()
  .then((result) => {
    if (window.location.href.indexOf(result.id) === -1) {
      browser.redirect('/' + result.id + '/emergency-help/')
    }
  })
