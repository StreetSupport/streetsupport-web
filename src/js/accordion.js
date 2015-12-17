var accordion = '.js-accordion'
var header = '.js-header'
var activeClass = 'is-active'

var init = function (showFirst) {
  // If not supported, exit out
  if (!document.querySelector || !document.querySelectorAll || !document.body.classList) {
    return
  }

  var i
  var el = document.querySelector(accordion)
  var headers = document.querySelectorAll(header)
  var itemCount = headers.length

  // Add active class to first elements or if there is only one panel
  if (showFirst || itemCount === 1) {
    el.children[0].classList.add(activeClass)
    el.children[1].classList.add(activeClass)
  }

  // Add click listener to headers
  for (i = 0; i < headers.length; i++) {
    headers[i].addEventListener('click', function (e) {
      open(this, el)
    })
  }
}

var open = function (el, context) {
  var i
  var children = context.children

  // Remove active classes in accordion
  for (i = 0; i < children.length; i++) {
    children[i].classList.remove(activeClass)
  }

  // Add active classes for clicked element and the next div
  el.classList.add(activeClass)
  el.nextElementSibling.classList.add(activeClass)
}

module.exports = {
  init: init
}
