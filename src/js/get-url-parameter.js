/* global location */

var getValue = function (needle, haystack) {
  needle = needle.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
  var regex = new RegExp('[\\?&]' + needle + '=([^&#]*)')
  var results = regex.exec(haystack)
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

var getUrlParameter = function (name) {
  return getValue(name, location.search)
}

module.exports = {
  parameter: getUrlParameter
}
