var Spinner = require('spin.js')

var redirect = function (url) {
  window.location = url
}

var loaderAnim
var getLoader = function () {
  if (loaderAnim === undefined) {
    loaderAnim = new Spinner()
  }
  return loaderAnim
}

var loading = function () {
  getLoader().spin(document.getElementById('spin'))
}

var loaded = function () {
  getLoader().stop()
}

module.exports = {
  redirect: redirect,
  loading: loading,
  loaded: loaded
}
