let browser = require('./browser')
let locationSelector = require('./location/locationSelector')

import './common'

const locationid = locationSelector.getSelectedLocationId()
const parentDir = locationid === 'elsewhere'
  ? 'find-help'
  : locationid
const redirectTo = `/${parentDir}/advice/`

if (!`${window.location.pathname}`.endsWith(redirectTo)) {
  browser.redirect(redirectTo)
}
