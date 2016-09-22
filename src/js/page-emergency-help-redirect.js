let browser = require('./browser')
let LocationSelector = require('./locationSelector')
let locationSelector = new LocationSelector()

locationSelector
  .getCurrent()
  .then((result) => {
    browser.redirect('/' + result.id + '/emergency-help')
  }, (_) => {

  })
