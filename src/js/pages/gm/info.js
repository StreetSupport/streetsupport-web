// Common modules
import '../../common'

const accordion = require('../../accordion')
const browser = require('../../browser')
const location = require('../../location/locationSelector')

const initLocations = function (currentLocation) {
  const ui = {
    form: document.querySelector('.js-change-location-form'),
    select: document.querySelector('.js-change-location-select')
  }
  ui.form.addEventListener('submit', function (e) {
    e.preventDefault()
    const reqLocation = ui.select.value
    if (reqLocation) {
      location.setCurrent(reqLocation)
      browser.redirect(`/${reqLocation}/advice`)
    }
  })

  if (currentLocation) {
    Array.from(document.querySelector('.js-change-location-select'))
      .filter((t) => t.tagName === 'OPTION')
      .find((o) => o.value === currentLocation.id)
      .setAttribute('selected', 'selected')
  }
}

location
  .getPreviouslySetPostcode()
  .then((result) => {
    accordion.init(false, -1)
    initLocations(result)
  })
