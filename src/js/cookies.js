var cookieCutter = require('cookie-cutter')

var set = function (key, value) {
  cookieCutter.set(key, value)
}

var get = function (key) {
  return cookieCutter.get(key)
}

var unset = function (key) {
  return cookieCutter.set(key, '', { expires: new Date(0) })
}

module.exports = {
  'set': set,
  'unset': unset,
  'get': get,
  keys: {
    location: 'desired-location'
  }
}
