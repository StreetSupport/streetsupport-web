/**
* @file Utils - generic JS UI util methods
* @author Daniel Furze <daniel@furzeface.com>
*/

var isSmallscreen = function () {
  return window.innerWidth < 480
}

module.exports = {
  isSmallscreen: isSmallscreen
}
