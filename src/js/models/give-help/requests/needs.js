import ko from 'knockout'
import moment from 'moment'
import htmlencode from 'htmlencode'

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

export const formatNeedsKO = (needs, position) => {
  return formatNeeds(needs, position)
    .map((n) => {
      return {
        id: ko.observable(n.id),
        detailsUrl: ko.observable(n.detailsUrl),
        description: ko.observable(n.description),
        serviceProviderName: ko.observable(htmlencode.htmlDecode(n.serviceProviderName)),
        locationDescription: ko.observable(n.locationDescription),
        formattedNeededDate: ko.observable(n.formattedNeededDate),
        neededDate: ko.observable(n.neededDate),
        distanceAwayInMetres: ko.observable(n.distanceAwayInMetres),
        keywords: ko.observableArray(n.keywords),
        type: ko.observable(n.type),
        isPriority: ko.observable(n.isPriority)
      }
    })
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
