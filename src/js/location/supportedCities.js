import { cities } from '../../data/generated/supported-cities'

/**
 * a collection of supported locations in street support
 */
const mungedCities = cities
  .filter((c) => c.isPublic)
mungedCities
  .forEach((c) => {
    c.isSelectableInBody = true
  })
const locations = mungedCities

const getById = (id) => {
  return locations.find((l) => l.id === id)
}

module.exports = {
  locations: locations,
  get: getById
}
