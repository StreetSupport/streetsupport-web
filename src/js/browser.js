/*
  global ga, document, history, window
*/

var Spinner = require('spin.js')

var redirect = function (url) {
  window.location = url
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

let getBody = () => {
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
  let gotoElement = () => {
    window.location.href = self.id
  }
  setTimeout(gotoElement, 250)
}

let pushHistory = (stateObject, title, url) => {
  history.pushState(stateObject, title, url)
}

let popHistory = () => {
  history.back()
}

let setOnHistoryPop = (onPopCallback) => {
  window.onpopstate = () => {
    onPopCallback()
  }
}

var scrollTo = function (selector) {
  const mobileHeader = document.querySelector('.header--mobile')
  
  const getDesktopHeaderHeight = () => {
    const desktopHeader = document.querySelector('.sticky')
    const navSubList = document.querySelector('.nav__list--sub-list')
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

  let findPos = (obj) => {
    var curtop = 0
    const offsetParent = obj.offsetParent
    if (obj.offsetParent) {
      do {
        curtop += obj.offsetTop
      } while (obj === obj.offsetParent)
      return [curtop - currentHeaderHeight]
    }
  }
  let element = document.querySelector(selector)
  window.scroll(0, findPos(element))
}

var trackEvent = function (src, action, description) {
  ga('send', 'event', src, action, description)
}

var print = function () {
  window.print()
}

module.exports = {
  redirect: redirect,
  loading: loading,
  loaded: loaded,
  trackEvent: trackEvent,
  scrollTo: scrollTo,
  jumpTo: jumpTo,
  print: print,
  pushHistory: pushHistory,
  popHistory: popHistory,
  setOnHistoryPop: setOnHistoryPop
}
