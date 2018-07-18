const location = require('../location/locationSelector')

const openElement = '.js-nav-open'
const closeElement = '.js-nav-close'
const overlayElement = '.js-nav-overlay'
const activeClass = 'is-active'
const subNavActiveClass = 'sub-nav-is-active'
const el = document.querySelectorAll('.js-nav-container, .js-nav-push, .js-nav-overlay, html, body')
const linksWithSubNav = document.querySelectorAll('.nav--mobile .nav__item-link--has-sub-nav')
const subNavBackButtons = document.querySelectorAll('.sub-list-back-btn')

const hideForCity = (cityId) => {
  let activeElementCount = 0;
  if (cityId) {
    const citySpecificElements = document.querySelectorAll('[data-city]')
    for (let i = 0; i < citySpecificElements.length; i++) {
      const citiesRequired = citySpecificElements[i].getAttribute('data-city')
      if (citiesRequired.indexOf(cityId) > -1) {
        citySpecificElements[i].classList.add('is-active') // desktop
        activeElementCount++;
      }
    }
  }
  if (activeElementCount === 0) {
    document.querySelector('.city-nav').classList.add('hide-screen')
  } 
}

var init = function () {
  document.querySelector(openElement).addEventListener('click', open)
  document.querySelector(closeElement).addEventListener('click', close)
  document.querySelector(overlayElement).addEventListener('click', close)

  for (let i = 0; i < linksWithSubNav.length; ++i) {
    linksWithSubNav[i].addEventListener('click', openSubNav)
  }

  for (let i = 0; i < subNavBackButtons.length; ++i) {
    subNavBackButtons[i].addEventListener('click', closeSubNav)
  }

  hideForCity(location.getSelectedLocationId())
}

const openSubNav = function(e) {
  e.preventDefault()
  e.target.parentNode.classList.add(subNavActiveClass)
  for (let i = 0; i < el.length; ++i) {
    el[i].classList.add(subNavActiveClass)
  }
}

const closeSubNav = function(e) {
  e.preventDefault()
  e.target.parentNode.parentNode.parentNode.classList.remove(subNavActiveClass)
  for (let i = 0; i < el.length; ++i) {
    el[i].classList.remove(subNavActiveClass)
  }
}

var open = function () {
  for (let i = 0; i < el.length; ++i) {
    el[i].classList.add(activeClass)
  }
}

var close = function (e) {
  for (let i = 0; i < el.length; ++i) {
    el[i].classList.remove(activeClass)
    el[i].classList.remove(subNavActiveClass)
  }
}

module.exports = {
  init: init,
  open: open,
  close: close
}
