const location = require('../location/locationSelector')

const openElement = '.js-nav-open'
const closeElement = '.js-nav-close'
const overlayElement = '.js-nav-overlay'
const navItemLinksWithSubNav = '.nav__item-link--has-sub-nav'
const activeClass = 'is-active'
const subNavActiveClass = 'sub-nav-is-active'
const el = document.querySelectorAll('.js-nav-container, .js-nav-push, .js-nav-overlay, html, body')
const linksWithSubNav = document.querySelectorAll(navItemLinksWithSubNav)

const hideForCity = (cityId) => {
  if (cityId) {
    var citySpecificElements = document.querySelectorAll('[data-city]')
    for (let i = 0; i < citySpecificElements.length; i++) {
      let citiesRequired = citySpecificElements[i].getAttribute('data-city')
      if (citiesRequired.indexOf(cityId) > -1) {
        citySpecificElements[i].classList.add('is-active') // desktop
      }
    }
  }
}

var init = function () {
  document.querySelector(openElement).addEventListener('click', open)
  document.querySelector(closeElement).addEventListener('click', close)
  document.querySelector(overlayElement).addEventListener('click', close)

  for (let i = 0; i < linksWithSubNav.length; ++i) {
    linksWithSubNav[i].addEventListener('click', openSubNav)
  }

  hideForCity(location.getSelectedLocationId())
}

var open = function () {
  var i

  for (i = 0; i < el.length; ++i) {
    el[i].classList.add(activeClass)
  }
}

const openSubNav = function(e) {
  e.preventDefault()
  e.target.parentNode.classList.add(subNavActiveClass)
  for (let i = 0; i < el.length; ++i) {
    el[i].classList.add(subNavActiveClass)
  }
}

var close = function (e) {
  console.log(e.target)
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
