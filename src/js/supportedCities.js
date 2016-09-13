var SupportedCities = function () {
  let self = this
  self.locations = [
    {
      'id': 'manchester',
      'name': 'Manchester',
      'longitude': -2.24455696347558,
      'latitude': 53.4792777155671
    },
    {
      'id': 'leeds',
      'name': 'Leeds',
      'longitude': -1.54511238485298,
      'latitude': 53.7954906003838
    }
  ]

  self.default = self.locations[0]

  self.get = (id) => {
    return self.locations.filter((l) => l.id === id)[0]
  }
}

module.exports = SupportedCities
