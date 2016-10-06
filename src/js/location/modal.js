const location = require('./locationSelector')
const supportedCities = require('./supportedCities')

const init = () => {
  let modal = document.querySelector('.js-location-select-modal')
  modal.classList.add('is-active')

  let modalCloser = document.querySelector('.js-modal-close')
  modalCloser.addEventListener('click', (e) => {
    modal.classList.remove('is-active')
    location.setCurrent(supportedCities.default().id)
    window.location.reload()
  })

  document.querySelector('.js-location-select-manchester')
    .addEventListener('click', (e) => {
      e.preventDefault()
      location.setCurrent('manchester')
      window.location.reload()
    })
  document.querySelector('.js-location-select-leeds')
    .addEventListener('click', (e) => {
      e.preventDefault()
      location.setCurrent('leeds')
      window.location.reload()
    })
}

module.exports = {
  init: init
}
