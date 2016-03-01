/* global XMLHttpRequest */

var Q = require('q')

var postApiData = function (url, data) {
  var deferred = Q.defer()
  var req = new XMLHttpRequest()
  req.open('POST', url, true)
  req.setRequestHeader('content-type', 'application/json')

  req.onload = function () {
    if (this.status === 201) {
      deferred.resolve({
        'status': 'ok'
      })
    } else {
      deferred.resolve({
        'status': 'error',
        'statusCode': this.status,
        'message': this.responseText
      })
    }
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
