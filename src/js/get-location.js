/* tba */
var Q = require('q')

var getLocation = function () {
  var deferred = Q.defer()
  var testValue = 123

  deferred.resolve(testValue)

  return deferred.promise
}

module.exports = {
  location: getLocation
}
