
const supportedCities = require('./supportedCities')
const browser = require('../browser')
const urlParams = require('../get-url-parameter')

import { newElement } from '../dom'

const init = (location) => {
  const modal = document.querySelector('.js-location-select-modal')

  if (modal) {
    modal.classList.add('is-active')

    const changeCity = (newCity) => {
      location.setCurrent(newCity)
      let currCity = urlParams.parameter('location')
      if (currCity.length > 0) {
        browser.redirect(window.location.href.replace(currCity, newCity))
      } else {
        window.location.reload()
      }
    }

    document.querySelector('.js-modal-close')
      .addEventListener('click', (e) => {
        modal.classList.remove('is-active')
        changeCity(supportedCities.default().id)
      })

    const dropdown = document.querySelector('.js-modal-location-dropdown')
    dropdown.innerHTML = ''
    dropdown.appendChild(newElement('option', '-- please select --'))

    supportedCities.locations
      .filter((c) => c.isPublic)
      .forEach((c) => {
        dropdown.appendChild(newElement('option', c.name, {
          value: c.id
        }))
      })

    dropdown
      .addEventListener('change', (e) => {
        e.preventDefault()
        const value = e.target.value
        if (value.length) {
          changeCity(value)
        }
      })
  }
}

module.exports = {
  init: init
}
