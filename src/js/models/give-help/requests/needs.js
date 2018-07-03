import moment from 'moment'
const geolib = require('geolib')

const getLocation = require('../../../location/get-location')

const formatDate = (n) => {
  n.formattedCreationDate = moment(n.creationDate).fromNow()
  n.formattedNeededDate = moment(n.neededDate).fromNow()
}

const setPostcodeAsLocation = (n) => {
  n.locationDescription = n.postcode
}

const setDistanceAsLocation = (n, { latitude, longitude }) => {
  const distanceInMetres = geolib.getDistance(
    { latitude: latitude, longitude: longitude },
    { latitude: n.latitude, longitude: n.longitude }
  )
  n.distanceAwayInMetres = distanceInMetres
  n.locationDescription = (distanceInMetres * 0.00062137).toFixed(2) + ' miles away'
}

export const formatNeeds = (needs, position) => {
  const locationFormatter = !position || getLocation.geoLocationUnavailable
    ? setPostcodeAsLocation
    : setDistanceAsLocation
  needs
    .forEach((n) => {
      n.neededDate = n.neededDate || n.creationDate
      formatDate(n)
      locationFormatter(n, position)
      n.detailsUrl = `request/?id=${n.id}`
    })
  return needs
}
