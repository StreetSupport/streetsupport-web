import Svg4everybody from 'svg4everybody'
import 'babel-polyfill'
// <=IE10 classlist polyfill
import 'classlist.js'

const nav = require('./navigation/nav.js')
const print = require('./navigation/print.js')
const analytics = require('./analytics')
const headerCitySelector = require('./navigation/headerCitySelector')
const delegate = require('delegate')

const removeNoJS = () => {
  var html = document.querySelector('html')
  html.classList.remove('no-js')
  html.classList.add('js')
}

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function () {
  var lastTime = 0
  var vendors = ['ms', 'moz', 'webkit', 'o']
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime()
      var timeToCall = Math.max(0, 16 - (currTime - lastTime))
      var id = window.setTimeout(function () { callback(currTime + timeToCall) },
        timeToCall)
      lastTime = currTime + timeToCall
      return id
    }
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id)
    }
  }
}())

// Check if we need fastclick
const fastClickCheck = () => {
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

const twitterShareWindow = function () {
  delegate('.js-twitterShareWindow', 'click', () => {
    const targetUrl = 'https://www.twitter.com/intent/tweet?url=' + window.location.href.replace('#', '') +
      '&text=' + document.title +
      '&via=streetsupportuk'

    window.open(targetUrl, 'blank', 'width=500,height=300')
  })
}

removeNoJS()
nav.init()
analytics.init()
print.init()
fastClickCheck()
Svg4everybody()
twitterShareWindow()

headerCitySelector.init()
