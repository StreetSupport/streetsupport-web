/*
  global ga, document, history, window, getComputedStyle
*/

var Spinner = require('spin.js')

var redirect = function (url) {
  window.location = url
}

const reload = () => {
  window.location.reload()
}

var loaderAnim

var getLoader = function () {
  if (loaderAnim === undefined) {
    loaderAnim = new Spinner({
      zIndex: 180
    })
  }
  return loaderAnim
}

const location = () => {
  return window.location
}

const getBody = () => {
  return document.getElementsByTagName('body')[0]
}

var loading = function () {
  getBody().className += ' page-loading'
  getLoader().spin(document.getElementById('spin'))
}

var loaded = function () {
  getBody().className = getBody().className.replace('page-loading', '')
  getLoader().stop()
}

var jumpTo = function (id) {
  var self = this
  self.id = id
  const gotoElement = () => {
    window.location.href = self.id
  }
  setTimeout(gotoElement, 250)
}

const pushHistory = (stateObject, title, url) => {
  history.pushState(stateObject, title, url)
}

const popHistory = () => {
  history.back()
}

const setOnHistoryPop = (onPopCallback) => {
  window.onpopstate = (e) => {
    onPopCallback(e)
  }
}

var scrollTo = function (selector) {
  const mobileHeader = document.querySelector('.header')

  const getDesktopHeaderHeight = () => {
    const desktopHeader = document.querySelector('.sticky')
    return desktopHeader.offsetHeight + 44 // navSubList.offsetHeight - doesn't return greater than 0!
  }

  const getMobileHeaderHeight = () => {
    return mobileHeader.offsetHeight
  }

  const getIsMobile = () => {
    const mobileHeaderDisplay = mobileHeader.currentStyle
      ? mobileHeader.currentStyle.display
      : getComputedStyle(mobileHeader, null).display
    return mobileHeaderDisplay === 'block'
  }

  const currentHeaderHeight = getIsMobile()
    ? getMobileHeaderHeight()
    : getDesktopHeaderHeight()

    const findPos = (obj) => {
    var curtop = 0
    if (obj.offsetParent) {
      do {
        curtop += obj.offsetTop
      } while (obj === obj.offsetParent)
      return [curtop - currentHeaderHeight]
    }
  }
  const element = document.querySelector(selector)
  window.scroll(0, findPos(element))
}

var trackEvent = function (src, action, description) {
  ga('send', 'event', src, action, description)
}

var print = function () {
  window.print()
}

const initPrint = () => {
  document.querySelector('.js-print-btn')
    .addEventListener('click', (e) => {
      e.preventDefault()
      window.print()
    })
}

module.exports = {
  redirect: redirect,
  reload: reload,
  location: location,
  loading: loading,
  loaded: loaded,
  trackEvent: trackEvent,
  scrollTo: scrollTo,
  jumpTo: jumpTo,
  print: print,
  initPrint: initPrint,
  pushHistory: pushHistory,
  popHistory: popHistory,
  setOnHistoryPop: setOnHistoryPop
}
