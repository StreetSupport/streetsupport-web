/* global twttr */

var el = '.social-share'

var init = function () {
  twttr.widgets.load(
    document.querySelectorAll(el)
  )
}

module.exports = {
  init: init
}
