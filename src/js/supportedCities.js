const locations = [
  {
    'id': 'leeds',
    'name': 'Leeds',
    'longitude': -1.54511238485298,
    'latitude': 53.7954906003838
  },
  {
    'id': 'manchester',
    'name': 'Manchester',
    'longitude': -2.24455696347558,
    'latitude': 53.4792777155671
  }
]

const get = (id) => {
  return locations.filter((l) => l.id === id)[0]
}

const getDefault = () => {
  return get(locations[1].id)
}

module.exports = {
  locations: locations,
  get: get,
  default: getDefault
}
