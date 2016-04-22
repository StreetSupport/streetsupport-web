/* global twttr, FB */

var el = '.social-share'

var init = function () {
  // Twitter
  console.log(twttr)
  console.log('calling twttr.widgets.load')

  twttr.widgets.load(
    document.querySelectorAll(el)
  )

  console.log(FB)
  console.log('calling FB.init')

  // Facebook
  FB.init()
}

module.exports = {
  init: init
}
