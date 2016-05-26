/* global ga */

var accordion = '.js-accordion'
var header = '.js-header'
var activeClass = 'is-active'
var myListener = {
  accordionOpened: function () { }
}

var init = function (showFirst, indexToOpen, listener) {
  // If not supported, exit out
  if (!document.querySelector || !document.querySelectorAll || !document.body.classList) {
    return
  }
  if (listener !== undefined) {
    myListener = listener
  }

  var i
  var el = document.querySelector(accordion)
  var headers = document.querySelectorAll(header)
  var itemCount = headers.length

  // Add active class to first elements or if there is only one panel
  if (showFirst || itemCount === 1) {
    var firstHeader = headers[0]
    open(firstHeader, el, true)
  } else if (indexToOpen >= 0) {
    open(headers[indexToOpen], el, true)
  }

  // Add click listener to headers
  for (i = 0; i < headers.length; i++) {
    headers[i].addEventListener('click', function (e) {
      open(this, el)
    })
  }
}

var open = function (el, context, noAnalytics) {
  myListener.accordionOpened(el, context)
  baseOpen(el, context, noAnalytics)
}

var reOpen = function (el, context, noAnalytics) {
  baseOpen(el, context, noAnalytics)
}

var baseOpen = function (el, context, noAnalytics) {
  close(el, context)

  // Check to see if clicked header is already active
  if (!el.classList.contains(activeClass)) {
    // Add active classes for clicked header and the item div
    el.classList.add(activeClass)
    el.nextElementSibling.classList.add(activeClass)

    // Send Google Analytics event
    if (!noAnalytics) {
      var headerText = el.textContent

      ga('send', 'event', 'accordion', 'click', headerText + ' open')
    }
  }
}

var close = function (el, context) {
  var b
  var children = context.children

  // Remove active classes in accordion
  for (b = 0; b < children.length; b++) {
    children[b].classList.remove(activeClass)
  }
}

module.exports = {
  init: init,
  reOpen: reOpen
}
