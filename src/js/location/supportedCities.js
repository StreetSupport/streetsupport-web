import { cities } from '../../data/generated/supported-cities'

/**
 * a generic location which the user can choose if they are not near a supported city
 */
const elsewhere = {
  'id': 'elsewhere',
  'findHelpId': 'my-location',
  'name': 'another location',
  'longitude': 0,
  'latitude': 90,
  'isPublic': true,
  'isSelectableInBody': false
}

/**
 * a collection of supported locations in street support
 */
const mungedCities = cities
  .filter((c) => c.isPublic)
mungedCities
  .forEach((c) => {
    c.isSelectableInBody = true
  })
const locations = [...mungedCities, elsewhere]

const getById = (id) => {
  return locations.find((l) => l.id === id)
}

const getDefault = () => {
  return elsewhere
}

module.exports = {
  locations: locations,
  get: getById,
  default: getDefault
}
