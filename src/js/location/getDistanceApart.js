const geolib = require('geolib')

module.exports = function ({ latA, longA }, { latB, longB }, descriptionUnits = 'miles') {
  const distanceInMetres = geolib.getDistance(
    { latitude: latA, longitude: longA },
    { latitude: latB, longitude: longB }
  )
  const description = descriptionUnits === 'miles'
    ? (distanceInMetres * 0.00062137).toFixed(2) + ' miles away'
    : (distanceInMetres / 1000).toFixed(2) + ' km away'
  return { distanceInMetres, description }
}
