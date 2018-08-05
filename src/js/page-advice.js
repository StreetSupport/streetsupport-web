import './common'

const browser = require('./browser')
const locationSelector = require('./location/locationSelector')
const getApiData = require('./get-api-data')
const apiRoutes = require('./api')
const templating = require('./template-render')

const locationid = locationSelector.getSelectedLocationId()

getApiData
  .data(apiRoutes.cities)
  .then((result) => {
    const city = result.data.find((c) => c.id === locationid)

    const callback = () => {
      if (browser.location().hash) {
        browser.scrollTo(browser.location().hash)
      }
    }

    if (city.swepIsAvailable) {
      templating.renderTemplate('js-swep-tpl', city, 'js-swep-output', callback)
    }
  }, (_) => { })

const links = document.querySelectorAll('a[href^="#"]')
links
  .forEach(l => {
    l.addEventListener('click', (e) => {
      e.preventDefault()
      const anchor = l.hash.substring(1)
      browser.scrollTo('#' + anchor)
      browser.pushHistory({}, anchor, browser.location() + '#' + anchor)
    })
  })
