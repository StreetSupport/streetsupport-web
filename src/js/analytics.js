/* global ga, location, document */

var init = function (title) {
  var i
  var el = document.getElementsByTagName('a')

  // Check if we need to alter page title in GA
  if (title) {
    ga('set', 'title', title)
    ga('send', 'pageview')
  } else {
    ga('send', 'pageview')
  }

  // External link check
  for (i = 0; i < el.length; i++) {
    el[i].addEventListener('click', function (event) {
      event.preventDefault()
      trackLink(this)
    })
  }
}

var trackLink = function (el) {
  function isUrlExternal (url) {
    var match = url.match(/^([^:/?#]+:)?(?:\/\/([^/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/)
    if (typeof match[1] === 'string' && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true
    if (typeof match[2] === 'string' && match[2].length > 0 && match[2].replace(new RegExp(':(' + { 'http:': 80, 'https:': 443 }[location.protocol] + ')?$'), '') !== location.host) return true
    return false
  }

  var theUrl = el.getAttribute('href')

  if (isUrlExternal(theUrl) === false) {
    document.location = theUrl
  } else {
    var hasRedirected = false
    var redirect = function () {
      if (hasRedirected) return
      document.location = theUrl
      hasRedirected = true
    }
    ga('send', 'event', 'outbound', 'click', theUrl, {
      'transport': 'beacon',
      'hitCallback': redirect
    })
    setTimeout(redirect, 2000)
  }
}

module.exports = {
  init: init
}
