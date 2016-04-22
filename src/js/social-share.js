/* global twttr, FB */

var init = function () {
  var el = '.social-share'
  twttr.widgets.load(document.querySelectorAll(el))
  FB.init()
}

module.exports = {
  init: init
}
