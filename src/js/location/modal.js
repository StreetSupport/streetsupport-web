
const supportedCities = require('./supportedCities')
import { redirectTo } from '../navigation/location-redirector'
import { newElement } from '../dom'

const init = (location) => {
  const modal = document.querySelector('.js-location-select-modal')

  if (modal) {
    modal.classList.add('is-active')

    const changeCity = (newCity) => {
      location.setCurrent(newCity)
      redirectTo(newCity)
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
        const attributes = {
          value: c.id
        }
        dropdown.appendChild(newElement('option', c.name, attributes))
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
