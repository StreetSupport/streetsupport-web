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

removeNoJS()
nav.init()
analytics.init()
fastClickCheck()
Svg4everybody() // SVG support
