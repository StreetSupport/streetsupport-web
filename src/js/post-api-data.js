/* global XDomainRequest, XMLHttpRequest */

var Q = require('q')

var postApiData = function (url, data) {
  var deferred = Q.defer()
  var req

  // Use XDomain for IE9
  if (window.XDomainRequest) {
    req = new XDomainRequest()
    req.open('POST', url)
    req.timeout = 5000
    req.setRequestHeader('content-type', 'application/json')
  } else {
    req = new XMLHttpRequest()
    req.open('POST', url, true)
    req.setRequestHeader('content-type', 'application/json')
  }

  // this needs to be set for IE9 for some reason
  req.onprogress = function () {

  }

  req.onload = function () {
    // This seems hacky but XDomain doesnt have a req.status
    if (window.XDomainRequest) {
      deferred.resolve({
        status: 'ok',
        statusCode: 200
      })
    }

    if (req.status === 201) {
      deferred.resolve({
        status: 'created',
        statusCode: this.status
      })
    } else if (req.status === 200) {
      deferred.resolve({
        status: 'ok',
        statusCode: this.status
      })
    } else {
      deferred.resolve({
        status: 'error',
        statusCode: req.status,
        messages: JSON.parse(req.responseText).messages
      })
    }
  }

  req.ontimeout = function () {
    deferred.reject(new Error('Server timeout'))
  }

  req.onerror = function () {
    deferred.reject(new Error('Server responded with a status of ' + req.status))
  }

  req.send(JSON.stringify(data))

  return deferred.promise
}

module.exports = {
  post: postApiData
}
