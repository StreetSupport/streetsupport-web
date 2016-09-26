import './common'

let browser = require('./browser')
let LocationSelector = require('./locationSelector')
let locationSelector = new LocationSelector()

locationSelector.handler((selectedLocation) => {
  console.log('/' + selectedLocation + '/emergency-help/')
  // browser.redirect('/' + selectedLocation + '/emergency-help/')
})

locationSelector
  .getCurrent()
  .then((result) => {
    if (window.location.href.indexOf(result.id) === -1) {
      browser.redirect('/' + result.id + '/emergency-help/')
    }
  })
