/* global twttr, FB */

var el = '.social-share'

var init = function () {
  // Twitter
  twttr.widgets.load(
    document.querySelectorAll(el)
  )

  // Facebook
  FB.init()
}

module.exports = {
  init: init
}
