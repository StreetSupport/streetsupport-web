var SupportedCities = function () {
  let self = this
  self.locations = [
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

  self.get = (id) => {
    return self.locations.filter((l) => l.id === id)[0]
  }

  self.default = self.get('manchester')
}

module.exports = SupportedCities
