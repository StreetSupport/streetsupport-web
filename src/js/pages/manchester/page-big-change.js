// Common modules
import '../../common'

const Location = require('../../locationSelector')
const location = new Location()
const browser = require('../../browser')

location
  .getCurrent()
  .then((result) => {
    if (result.id === 'leeds') {
      browser.redirect('/leeds/big-change/')
    }
  })
