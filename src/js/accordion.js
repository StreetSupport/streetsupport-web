/* global ga */

var activeClass = 'is-active'
var myListener = {
  accordionOpened: function () { }
}

const defaultSelectors = {
  accordion: '.js-accordion',
  header: '.js-header'
}

var init = function (showFirst, indexToOpen, listener, showAll, selectors = defaultSelectors) {
  // If not supported, exit out
  if (!document.querySelector || !document.querySelectorAll || !document.body.classList) {
    return
  }
  if (listener !== undefined) {
    myListener = listener
  }

  var i
  var el = document.querySelectorAll(selectors.accordion)
  var headers = document.querySelectorAll(selectors.header)
  var itemCount = headers.length

  // Add active class to first elements or if there is only one panel
  if (!showAll && (showFirst || itemCount === 1)) {
    var firstHeader = headers[0]
    open(firstHeader, el, true)
  } else if (!showAll && indexToOpen >= 0) {
    open(headers[indexToOpen], el, true)
  }

  // Add click listener to headers
  for (i = 0; i < headers.length; i++) {
    headers[i].addEventListener('click', function (e) {
      const isActive = Array.from(e.target.classList).includes(activeClass)
      const action = isActive
        ? close
        : open
      action(this, el)
    })
    if (showAll) {
      headers[i].nextElementSibling.classList.add(activeClass)
    }
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
  const closeInActive = function (currAccordion) {
    var children = currAccordion.children

    // Remove active classes in accordion
    for (var b = 0; b < children.length; b++) {
      children[b].classList.remove(activeClass)
    }
  }

  if (!context.length) {
    closeInActive(context)
  } else {
    for (var i = 0; i < context.length; i++) {
      var currAccordion = context[i]
      closeInActive(currAccordion)
    }
  }
}

module.exports = {
  init: init,
  reOpen: reOpen
}
