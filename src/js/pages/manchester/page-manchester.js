// Common modules
import '../../common'

const browser = require('../../browser')
const location = require('../../location/locationSelector')

location.getCurrentHub()
  .then((result) => {
    if (result.id !== 'manchester') {
      location.setCurrent('manchester')
      browser.reload()
    }
  })
