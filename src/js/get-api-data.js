/* global XDomainRequest, XMLHttpRequest */

var Q = require('q')

const statusKeys = {
  ok: 'ok',
  notFound: 'notFound',
  error: 'error'
}

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
        status: statusKeys.ok,
        data: jsonXDomain
      })
    }

    if (req.status === 200 || req.status === 304) {
      var json = JSON.parse(req.responseText)
      deferred.resolve({
        status: statusKeys.ok,
        data: json
      })
    } else if (req.status === 404) { // todo: this never gets hit! VL
      deferred.resolve({
        status: statusKeys.notFound
      })
    } else {
      deferred.resolve({
        status: statusKeys.error,
        statusCode: req.status,
        message: req.responseText
      })
    }
  }

  req.ontimeout = function () {
    deferred.reject(new Error('Server timeout'))
  }

  req.onerror = function (e) {
    deferred.reject(new Error('Server responded with a status of ' + this))
  }

  req.send()

  return deferred.promise
}

const status = (result) => {
  return {
    isOk: () => result.status === statusKeys.ok,
    isNotFound: () => result.status === statusKeys.notFound
  }
}

module.exports = {
  data: getApiData,
  status: status
}
