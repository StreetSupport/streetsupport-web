// Common modules
import './common'
const browser = require('./browser')
const location = require('./location/locationSelector')
const templating = require('./template-render')

import { getData } from './models/find-help/categories'
import { cities } from '../data/generated/supported-cities'

templating.renderTemplate('js-cities-list-tpl', { cities }, 'js-cities-list-output', () => {
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
})
templating.renderTemplate('js-category-list-tpl', getData(), 'js-category-list-output', () => { })
