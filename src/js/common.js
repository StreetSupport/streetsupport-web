var nav = require('./nav.js')
var analytics = require('./analytics')
import Svg4everybody from 'svg4everybody'
import webFontLoader from 'webfontloader'

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

let loadWebFonts = () => {
  webFontLoader.load({
    custom: ['museo_sans_rounded300', 'museo_sans_rounded500']
  })
}

removeNoJS()
nav.init()
analytics.init()
fastClickCheck()
Svg4everybody()
loadWebFonts()
