/* global XDomainRequest, XMLHttpRequest */

var Q = require('q')

var getApiData = function (url) {
  var deferred = Q.defer()
  var req

  // Use XDomain for IE9
  if (window.XDomainRequest) {
    req = new XDomainRequest()
    req.open('GET', url)
    req.timeout = 5000
  } else {
    req = new XMLHttpRequest()
    req.open('GET', url, true)
  }

  // this needs to be set for IE9 for some reason
  req.onprogress = function () {

  }

  req.onload = function () {
    // This seems hacky but XDomain doesnt have a req.status
    if (window.XDomainRequest) {
      var jsonXDomain = JSON.parse(req.responseText)
      deferred.resolve({
        'status': 'ok',
        'data': jsonXDomain
      })
    }

    if (req.status === 200) {
      var json = JSON.parse(req.responseText)
      deferred.resolve({
        'status': 'ok',
        'data': json
      })
    } else {
      deferred.resolve({
        'status': 'error',
        'statusCode': req.status,
        'message': req.responseText
      })
    }
  }

  req.ontimeout = function () {
    deferred.reject(new Error('Server timeout'))
  }

  req.onerror = function () {
    deferred.reject(new Error('Server responded with a status of ' + req.status))
  }

  req.send()

  return deferred.promise
}

module.exports = {
  data: getApiData
}
