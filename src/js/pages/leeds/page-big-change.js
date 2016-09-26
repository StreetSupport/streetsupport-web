// Common modules
import '../../common'

const Location = require('../../locationSelector')
const location = new Location()
const browser = require('../../browser')

const mcrBigChangeLink = document.querySelector('.js-mcr-big-change')
mcrBigChangeLink.addEventListener('click', (e) => {
  e.preventDefault()
  location.setCurrent('manchester')
  browser.redirect('/manchester/bigchangemcr/')
})
