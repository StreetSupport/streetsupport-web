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
