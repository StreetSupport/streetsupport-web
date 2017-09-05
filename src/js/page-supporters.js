// Common modules
import './common'

const browser = require('./browser')

window.onload = function () {
  if (window.location.hash) {
    browser.scrollTo(window.location.hash)
  }
}
