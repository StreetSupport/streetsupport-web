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
  {
    'id': 'elsewhere',
    'findHelpId': 'my-location',
    'name': 'somewhere else',
    'longitude': 0,
    'latitude': 90,
    'isSelectableInHeader': true
  }
]

const get = (id) => {
  return locations.find((l) => l.id === id)
}

const getDefault = () => {
  return get('elsewhere')
}

module.exports = {
  locations: locations,
  get: get,
  default: getDefault
}
