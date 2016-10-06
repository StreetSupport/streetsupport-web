const stickyNavShrinker = require('./sticky-nav-shrink')
const LocationSelector = require('./locationSelector')
const SupportedCities = require('./supportedCities')
const mobileCitySelect = require('./navigation/mobile-city-selection')

const openElement = '.js-nav-open'
const closeElement = '.js-nav-close'
const overlayElement = '.js-nav-overlay'
const activeClass = 'is-active'
const el = document.querySelectorAll('.js-nav-container, .js-nav-push, .js-nav-overlay, html, body')
const supportedCities = new SupportedCities()
const location = new LocationSelector()

const hideForCity = (cityId) => {
  var citySpecificElements = document.querySelectorAll('[data-city]')
  for (let i = 0; i < citySpecificElements.length; i++) {
    let citiesRequired = citySpecificElements[i].getAttribute('data-city')
    if (citiesRequired.indexOf(cityId) > -1) {
      citySpecificElements[i].classList.add('is-active') // desktop
    }
  }
  var currentCity = document.querySelector('.js-current-city')
  currentCity.innerHTML = supportedCities.get(cityId).name
}

var init = function () {
  document.querySelector(openElement).addEventListener('click', function (e) {
    open()
  })

  document.querySelector(closeElement).addEventListener('click', function (e) {
    close()
  })

  document.querySelector(overlayElement).addEventListener('click', function (e) {
    close()
  })

  location
    .getCurrent()
    .then((result) => {
      hideForCity(result.id)
    })

  stickyNavShrinker.init()
  mobileCitySelect.init()
}

var open = function () {
  var i

  for (i = 0; i < el.length; ++i) {
    el[i].classList.add(activeClass)
  }
}

var close = function () {
  var i

  for (i = 0; i < el.length; ++i) {
    el[i].classList.remove(activeClass)
  }
}

module.exports = {
  init: init,
  open: open,
  close: close
}
