// Common modules
import './common'
const browser = require('./browser')
const location = require('./location/locationSelector')

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
