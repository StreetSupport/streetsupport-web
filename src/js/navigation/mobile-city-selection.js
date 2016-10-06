const LocationSelector = require('../locationSelector')
const browser = require('../browser')

const location = new LocationSelector()

const handleClick = (e) => {
  e.preventDefault()
  let city = e.target.parentNode.getAttribute('data-city')
  location.setCurrent(city)
  browser.redirect('/' + city)
}

const init = () => {
  let cityNavItems = document.querySelectorAll('.js-city-nav-item')
  for (let i = 0; i < cityNavItems.length; i++) {
    cityNavItems[i].addEventListener('click', handleClick)
  }
}

module.exports = {
  init: init
}
