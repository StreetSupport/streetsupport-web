var nav = require('./nav.js')
var analytics = require('./analytics')
import Svg4everybody from 'svg4everybody'

nav.init()
analytics.init()

var html = document.querySelector('html')
html.classList.remove('no-js')
html.classList.add('js')

// Check if we need fastclick
if ('touchAction' in document.body.style) {
  document.body.style.touchAction = 'manipulation'
} else {
  require.ensure(['fastclick'], (require) => {
    const FastClick = require('fastclick')

    window.addEventListener('load', () => {
      FastClick.attach(document.body)
    })
  }, 'fastclick')
}

// SVG support
Svg4everybody()

let pathName = window.location.pathname
let activePage = pathName.length > 1
  ? '/' + pathName.split('/')[1] + '/'
  : '/'

let navLinks = document.querySelectorAll('.nav__item a')
let activeNav = Array.from(navLinks).filter((l) => {
  return l.getAttribute('href') === activePage
})[0]

console.log(activePage)
activeNav.parentNode.classList.add('nav__item--active')
