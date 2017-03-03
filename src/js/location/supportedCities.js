/**
 * a generic location which the user can choose if they are not near a supported city
 */
const elsewhere = {
  'id': 'elsewhere',
  'findHelpId': 'my-location',
  'name': 'somewhere else',
  'longitude': 0,
  'latitude': 90,
  'isSelectableInHeader': true,
  'isSelectableInBody': false
}

/**
 * a collection of supported locations in street support
 */
const locations = [
  {
    'id': 'leeds',
    'findHelpId': 'leeds',
    'name': 'Leeds',
    'longitude': -1.54511238485298,
    'latitude': 53.7954906003838,
    'isSelectableInHeader': true,
    'isSelectableInBody': true
  },
  {
    'id': 'manchester',
    'findHelpId': 'manchester',
    'name': 'Manchester',
    'longitude': -2.24455696347558,
    'latitude': 53.4792777155671,
    'isSelectableInHeader': true,
    'isSelectableInBody': true
  },
  elsewhere
]

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
