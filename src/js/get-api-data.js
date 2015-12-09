var Q = require('q')

var getApiData = function (url) {
  var deferred = Q.defer()
  var req = new XMLHttpRequest() // eslint-disable-line

  req.open('GET', url, true)

  req.onload = function () {
    if (this.status === 200) {
      var json = JSON.parse(req.responseText)
      deferred.resolve(json)
    } else {
      // tba better error handling
      alert('error')  // eslint-disable-line
    }
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
