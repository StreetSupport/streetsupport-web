// Common modules
import '../../common'

const location = require('../../location/locationSelector')
const browser = require('../../browser')

location
  .getCurrent()
  .then((result) => {
    if (result.id === 'leeds') {
      browser.redirect('/leeds/big-change/')
    }
  })
