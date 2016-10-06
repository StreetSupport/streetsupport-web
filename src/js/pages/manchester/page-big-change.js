// Common modules
import '../../common'

const Location = require('../../location/locationSelector')
const location = new Location()
const browser = require('../../browser')

location
  .getCurrent()
  .then((result) => {
    if (result.id === 'leeds') {
      browser.redirect('/leeds/big-change/')
    }
  })
