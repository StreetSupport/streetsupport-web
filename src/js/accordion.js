/* global ga */

var accordion = '.js-accordion'
var header = '.js-header'
var icon = '.icon'
var iconOpenClass = 'icon-plus'
var iconCloseClass = 'icon-minus'
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
    var firstHeader = headers[0]
    open(firstHeader, el, true)
  }

  // Add click listener to headers
  for (i = 0; i < headers.length; i++) {
    headers[i].addEventListener('click', function (e) {
      open(this, el)
    })
  }
}

var open = function (el, context, noAnalytics) {
  // Check to see if clicked header is already active
  if (el.classList.contains(activeClass)) {
    close(el, context)
  } else {
    close(el, context)

    // Add active classes for clicked header and the item div
    el.classList.add(activeClass)
    el.nextElementSibling.classList.add(activeClass)

    // Change icon class in header
    el.querySelector(icon).classList.remove(iconOpenClass)
    el.querySelector(icon).classList.add(iconCloseClass)

    // Send Google Analytics event
    if (!noAnalytics) {
      var headerText = el.textContent

      ga('send', 'event', 'accordion', 'click', headerText + ' open')
    }
  }
}

var close = function (el, context) {
  var a
  var b
  var children = context.children
  var headers = context.querySelectorAll(icon)

  // Change icon class in header
  for (a = 0; a < headers.length; a++) {
    headers[a].classList.remove(iconCloseClass)
    headers[a].classList.add(iconOpenClass)
  }

  // Remove active classes in accordion
  for (b = 0; b < children.length; b++) {
    children[b].classList.remove(activeClass)
  }
}

module.exports = {
  init: init
}
