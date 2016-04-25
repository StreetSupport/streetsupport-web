var nav = require('./nav.js')
var analytics = require('./analytics')
import Svg4everybody from 'svg4everybody'

let removeNoJS = () => {
  var html = document.querySelector('html')
  html.classList.remove('no-js')
  html.classList.add('js')
}

let fastClickCheck = () => {
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
}

let setActiveNav = () => {
  let pathName = window.location.pathname
  let activePage = pathName.length > 1
    ? '/' + pathName.split('/')[1] + '/'
    : pathName

  let activeNav = Array.from(document.querySelectorAll('.nav__item a'))
    .filter((l) => {
      return l.getAttribute('href') === activePage
    })[0]

  activeNav.parentNode.classList.add('nav__item--active')
}

removeNoJS()
nav.init()
analytics.init()
fastClickCheck()
setActiveNav()
Svg4everybody() // SVG support
