import moment from 'moment'

const getLocation = require('../../../location/get-location')
const getDistanceApart = require('../../../location/getDistanceApart')

const formatDate = (n) => {
  n.formattedCreationDate = moment(n.creationDate).fromNow()
  n.formattedNeededDate = moment(n.neededDate).fromNow()
}

const setPostcodeAsLocation = (n) => {
  n.locationDescription = n.postcode
}

const setDistanceAsLocation = (n, { latitude, longitude }) => {
  const { distanceInMetres, description } = getDistanceApart(
    { latA: n.latitude, longA: n.longitude },
    { latB: latitude, longB: longitude })
  n.distanceAwayInMetres = distanceInMetres
  n.locationDescription = description
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
