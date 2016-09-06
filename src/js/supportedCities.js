const getLocation = require('./get-location')
const geolib = require('geolib')
const Q = require('q')

let SupportedCities = () => {
  let self = this
  self.locations = [
    {
      'key': 'manchester',
      'name': 'Manchester',
      'longitude': -2.24455696347558,
      'latitude': 53.4792777155671
    },
    {
      'key': 'leeds',
      'name': 'Leeds',
      'longitude': -1.54511238485298,
      'latitude': 53.7954906003838
    }
  ]

  self.nearest = () => {
    let deferred = Q.defer()

    if (navigator.geolocation) {
      getLocation.location().then((position) => {
        let currLatitude = position.coords.latitude
        let currLongitude = position.coords.longitude

        for (let i = 0; i < self.locations.length; i++) {
          let distanceInMetres = geolib.getDistance(
            { latitude: currLatitude, longitude: currLongitude },
            { latitude: self.locations[i].latitude, longitude: self.locations[i].longitude }
          )
          self.locations[i].distance = distanceInMetres
        }

        let sorted = self.locations
          .sort((a, b) => {
            if (a.distance < b.distance) return -1
            if (a.distance > b.distance) return 1
            return 0
          })

        deferred.resolve(sorted[0])
      })
    } else {
      deferred.resolve(self.locations[0])
    }

    return deferred.promise
  }
}

module.exports = SupportedCities
