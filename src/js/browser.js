/*
  global ga, document, history
*/

var Spinner = require('spin.js')

var redirect = function (url) {
  window.location = url
}

var loaderAnim

var getLoader = function () {
  if (loaderAnim === undefined) {
    loaderAnim = new Spinner()
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
  let findPos = (obj) => {
    var curtop = 0
    if (obj.offsetParent) {
      do {
        curtop += obj.offsetTop
      } while (obj === obj.offsetParent)
      return [curtop]
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
