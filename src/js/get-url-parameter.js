/* global location */

var getUrlParameter = function (name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
  var results = regex.exec(location.search)
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

var getKeyValuePairs = function (param) {
  return param.split('=')
}

var getUrlParameterFromString = function (url, reqKey) {
  var queryString = url.split('?')[1]
  var params = queryString.split('&')
  return params
    .map(param => getKeyValuePairs(param))
    .find(kv => kv[0] === reqKey)[1]
}

module.exports = {
  parameter: getUrlParameter,
  parameterFromString: getUrlParameterFromString
}
