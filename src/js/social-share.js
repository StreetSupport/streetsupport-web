/* global twttr */

var init = function () {
  var el = '.social-share'
  twttr.widgets.load(document.querySelectorAll(el))
  var fbElement = document.querySelectorAll('.fb-share-button')
  fbElement.setAttribute('data-href', window.location.href)
}

module.exports = {
  init: init
}
