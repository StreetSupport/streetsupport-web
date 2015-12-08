var Q = require('q')
var apiRoutes = require('./api')

var categoryResultData = function () {
  var deferred = Q.defer(),
  req = new XMLHttpRequest()

  req.open('GET', apiRoutes.allServiceProviders, true)

  req.onload = function() {
    if (this.status === 200) {
      var json = JSON.parse(req.responseText)
      deferred.resolve(json)
    }
    else {
      alert('error')
    }
  }

  req.onerror = function() {
    deferred.reject(new Error('Server responded with a status of ' + req.status))
  }

  req.send()

  return deferred.promise
}

module.exports = {
  data: categoryResultData
}
