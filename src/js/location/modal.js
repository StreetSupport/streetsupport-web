const supportedCities = require('./supportedCities')
const urlParams = require('../get-url-parameter')
const browser = require('../browser')

const init = (location) => {

  const modal = document.querySelector('.js-location-select-modal')
  modal.classList.add('is-active')

  const changeCity = (newCity) => {
    location.getCurrent()
      .then((currLocation) => {
        console.log(currLocation)
        location.setCurrent(newCity)
        let currCity = currLocation.id
        if (currCity.length > 0) {
          browser.redirect(window.location.href.replace(currCity, newCity))
        } else {
          window.location.reload()
        }
      }, (_) => {
        window.location.reload()
      })
  }

  const modalCloser = document.querySelector('.js-modal-close')
  modalCloser.addEventListener('click', (e) => {
    modal.classList.remove('is-active')
    changeCity(supportedCities.default().id)
  })

  document.querySelector('.js-location-select-manchester')
    .addEventListener('click', (e) => {
      e.preventDefault()
      changeCity('manchester')
    })
  document.querySelector('.js-location-select-leeds')
    .addEventListener('click', (e) => {
      e.preventDefault()
      changeCity('leeds')
    })
}

module.exports = {
  init: init
}
