/* global twttr */

var init = function () {
  var el = '.social-share'
  twttr.widgets.load(document.querySelectorAll(el))
  var fbElement = document.querySelectorAll('.fb-share-button')
  fbElement.setAttribute('data-href', window.location.href)
}

function updateSharePageHrefs () {
  var twitterElementAlt = document.querySelectorAll('.js-tweet-page')
  var currentTwitterHref = twitterElementAlt[0].getAttribute('href')
  twitterElementAlt[0].setAttribute('href', currentTwitterHref + '&url=' + window.location.href)

  var fbElementAlt = document.querySelectorAll('.js-fb-share-page')
  var currentFbHref = fbElementAlt[0].getAttribute('href')
  fbElementAlt[0].setAttribute('href', currentFbHref + '?u=' + window.location.href)

  var emailElementAlt = document.querySelectorAll('.js-email-page')
  var currentMailToHref = emailElementAlt[0].getAttribute('href')
  emailElementAlt[0].setAttribute('href', currentMailToHref + '&body=' + window.location.href)
}

module.exports = {
  init: init,
  updateSharePageHrefs: updateSharePageHrefs
}
