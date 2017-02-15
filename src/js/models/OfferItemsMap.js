/* global google */

const htmlEncode = require('htmlencode')
const ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!

const apiRoutes = require('../api')
const getApi = require('../get-api-data')

var OfferItemModel = function (currentLocation) {
  var self = this
  self.needCategories = ko.observableArray()
  self.showFilter = ko.observable(false)
  self.infoWindows = []
  self.markers = []
  self.map = null

  self.buildInfoWindowMarkup = (p) => {
    return `<div class="map-info-window">
        <h1 class="h2"><a href="/find-help/organisation/?organisation=${p.key}">${htmlEncode.htmlDecode(p.name)}</a></h1>
        <p>${htmlEncode.htmlDecode(p.itemsDonationDescription)}</p>
        <a href="/find-help/organisation/?organisation=${p.key}" class="btn btn--brand-e">
          <span class="btn__text">More about ${htmlEncode.htmlDecode(p.name)}</span>
        </a>
      </div>`
  }

  self.buildMap = (userLocation) => {
    const centre = {lat: userLocation.latitude, lng: userLocation.longitude}
    return new google.maps.Map(document.querySelector('.js-map'), {
      zoom: 11,
      center: centre
    })
  }

  self.displayMap = (providers, userLocation) => {
    self.map = self.buildMap(userLocation)

    providers
      .forEach((p) => {
        if (p.addresses.length === 0) return

        const infoWindow = new google.maps.InfoWindow({
          content: self.buildInfoWindowMarkup(p)
        })

        self.infoWindows.push(infoWindow)

        const marker = new google.maps.Marker({
          position: { lat: p.addresses[0].latitude, lng: p.addresses[0].longitude },
          map: self.map,
          title: `${htmlEncode.htmlDecode(p.name)}`
        })
        marker.categories = p.needCategories

        marker.addListener('click', () => {
          self.infoWindows
            .forEach((w) => w.close())
          infoWindow.open(self.map, marker)
        })

        self.markers.push(marker)
      })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        new google.maps.Marker({ // eslint-disable-line
          position: pos,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            fillColor: 'blue',
            strokeColor: 'blue'
          },
          map: self.map
        })
      }, function () {
      })
    } else {
      // Browser doesn't support Geolocation
    }
  }

  self.buildCatsFilter = (providers, needCategories) => {
    const availableCats = providers
      .map((p) => p.needCategories)
      .reduce((acc, cats) => {
        return [...acc, ...cats]
      }, [])
    const uniqueAvailableCats = [...new Set(availableCats)]
    const cats = needCategories
      .filter((nc) => uniqueAvailableCats.includes(nc.key))
      .map((c) => {
        return {
          id: ko.observable(c.key),
          name: ko.observable(c.value),
          cssClass: ko.observable('subcat-filter__item')
        }
      })
    cats.unshift({
      id: ko.observable('all'),
      name: ko.observable('All'),
      cssClass: ko.observable('subcat-filter__item on')
    })
    self.showFilter(cats.length > 1)
    self.needCategories(cats)
  }

  self.filter = (c) => {
    self.needCategories()
      .forEach((c) => {
        c.cssClass('subcat-filter__item')
      })
    c.cssClass('subcat-filter__item on')
    if (c.id() === 'all') {
      self.markers
        .forEach((m) => m.setMap(self.map))
    } else {
      self.markers
        .filter((m) => !m.categories.includes(c.id()))
        .forEach((m) => m.setMap(null))
      self.markers
        .filter((m) => m.categories.includes(c.id()))
        .forEach((m) => m.setMap(self.map))
    }
  }

  getApi.data(apiRoutes.serviceProviders + currentLocation.id)
    .then((providers) => {
      getApi.data(apiRoutes.needCategories)
        .then((needCategories) => {
          self.buildCatsFilter(providers.data, needCategories.data)
          self.displayMap(providers.data, currentLocation)
        })
    })
}

module.exports = OfferItemModel
