let browser = require('./browser')
let locationSelector = require('./location/locationSelector')

locationSelector
  .getCurrent()
  .then((result) => {
    browser.redirect('/' + result.id + '/emergency-help')
  }, (_) => {

  })
