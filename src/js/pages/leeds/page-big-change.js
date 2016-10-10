// Common modules
import '../../common'

const location = require('../../location/locationSelector')
const browser = require('../../browser')

const mcrBigChangeLink = document.querySelector('.js-mcr-big-change')
mcrBigChangeLink.addEventListener('click', (e) => {
  e.preventDefault()
  location.setCurrent('manchester')
  browser.redirect('/manchester/bigchangemcr/')
})
