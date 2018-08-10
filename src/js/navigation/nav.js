const openElement = '.js-nav-open'
const closeElement = '.js-nav-close'
const overlayElement = '.js-nav-overlay'
const activeClass = 'is-active'
const subNavActiveClass = 'sub-nav-is-active'
const el = document.querySelectorAll('.js-nav-container, .js-nav-push, .js-nav-overlay, html, body')
const linksWithSubNav = document.querySelectorAll('.nav .nav__item-link--has-sub-nav')
const subNavBackButtons = document.querySelectorAll('.sub-list-back-btn')
const locationNavLinks = document.querySelectorAll('.nav__item--locations .nav__list .nav__item')

const browser = require('../browser')
const locationSelector = require('../location/locationSelector')

var init = function () {
  if (window.getComputedStyle(document.querySelector('.header__btn')).display === 'block') { // we're in mobile!
    document.querySelector(openElement).addEventListener('click', open)
    document.querySelector(closeElement).addEventListener('click', close)
    document.querySelector(overlayElement).addEventListener('click', close)

    for (let i = 0; i < linksWithSubNav.length; ++i) {
      linksWithSubNav[i].addEventListener('click', openSubNav)
    }

    for (let i = 0; i < subNavBackButtons.length; ++i) {
      subNavBackButtons[i].addEventListener('click', closeSubNav)
    }

    for (let i = 0; i < locationNavLinks.length; ++i) {
      locationNavLinks[i].addEventListener('click', setLocationId)
    }
  }
}

const openSubNav = function (e) {
  e.preventDefault()
  e.target.parentNode.classList.add(subNavActiveClass)
  for (let i = 0; i < el.length; ++i) {
    el[i].classList.add(subNavActiveClass)
  }
  document.querySelector('.js-nav-container').scrollTop = 0
}

const closeSubNav = function (e) {
  e.preventDefault()
  e.target.parentNode.parentNode.parentNode.classList.remove(subNavActiveClass)
  for (let i = 0; i < el.length; ++i) {
    el[i].classList.remove(subNavActiveClass)
  }
}

const setLocationId = function (e) {
  const locationId = e.target.parentNode.dataset.location
  if (locationId !== undefined) {
    e.preventDefault()
    locationSelector.setCurrent(locationId)
    browser.redirect(`/${locationId}/`)
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
