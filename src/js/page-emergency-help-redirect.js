let browser = require('./browser')
let locationSelector = require('./location/locationSelector')

import './common'

locationSelector
  .getCurrent()
  .then((result) => {
    const parentDir = result.id !== 'elsewhere'
      ? 'find-help'
      : result.id
    const redirectTo = `/${parentDir}/emergency-help/`

    if (!`/${window.location.pathname}`.contains(redirectTo)) {
      browser.redirect(redirectTo)
    }
  }, (_) => {

  })
