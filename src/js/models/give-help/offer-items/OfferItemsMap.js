/* global google */

const htmlEncode = require('htmlencode')
const ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!

const apiRoutes = require('../../../api')
const getApi = require('../../../get-api-data')
const listToDropdown = require('../../../list-to-dropdown')

var OfferItemModel = function () {
  var self = this
  self.allNeedCategories = ko.observableArray()
  self.providers = ko.observableArray()
  self.infoWindows = []
  self.markers = []
  self.map = null

  self.needCategories = ko.computed(() => {
    const getUniqueNeedCategories = function (providers) {
      const availableCats = providers
        .map((p) => p.needCategories)
        .reduce((acc, cats) => {
          return [...acc, ...cats]
        }, [])
      return [...new Set(availableCats)]
    }

    const cats = self.allNeedCategories()
      .filter((nc) => getUniqueNeedCategories(self.providers()).includes(nc.key))
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

    return cats
  }, self)
  self.showFilter = ko.computed(() => self.needCategories().length > 1, self)

  self.providers.subscribe((newValue) => {
    const subCatFilter = {
      selectors: {
        item: '.subcat-filter__item',
        selectedItem: '.subcat-filter__item.on',
        asDropdown: '.list-to-dropdown__select'
      }
    }

    const initSubCatAsDropdown = function () {
      const dropdown = document.querySelector(subCatFilter.selectors.asDropdown)
      const filterItems = document.querySelector(subCatFilter.selectors.selectedItem)

      dropdown.value = filterItems.innerText
      dropdown.addEventListener('change', (e) => {
        const value = e.target.value
        const c = self.needCategories().find((nc) => nc.name() === value)
        self.filter(c)
      })
    }

    listToDropdown.init(initSubCatAsDropdown)
  })

  self.buildInfoWindowMarkup = (p) => {
    return `<div class="map-info-window">
        <h1 class="h2"><a href="/find-help/organisation/?organisation=${p.key}">${htmlEncode.htmlDecode(p.name)}</a></h1>
        <p>${htmlEncode.htmlDecode(p.itemDonationDescription)}</p>
        <a href="/find-help/organisation/?organisation=${p.key}" class="btn btn--brand-e">
          <span class="btn__text">More about ${htmlEncode.htmlDecode(p.name)}</span>
        </a>
      </div>`
  }

  self.buildMap = (userLocation) => {
    const centre = { lat: userLocation.latitude, lng: userLocation.longitude }
    return new google.maps.Map(document.querySelector('.js-map'), {
      zoom: 11,
      center: centre
    })
  }

  const createInfoWindow = function (provider, buildMarkup) {
    const infoWindow = new google.maps.InfoWindow({
      content: buildMarkup(provider)
    })

    self.infoWindows.push(infoWindow)
    return infoWindow
  }

  const createMarker = function (provider, infoWindow) {
    provider.locations
      .forEach((l) => {
        console.log(provider, l)
        const marker = new google.maps.Marker({
          position: { lat: l.latitude, lng: l.longitude },
          map: self.map,
          title: `${htmlEncode.htmlDecode(provider.name)}`
        })
        marker.categories = provider.needCategories

        marker.addListener('click', () => {
          self.infoWindows
            .forEach((w) => w.close())
          infoWindow.open(self.map, marker)
        })

        self.markers.push(marker)
      })
  }

  const createCurrPosMarker = function () {
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
  }

  self.displayMap = (userLocation) => {
    self.map = self.buildMap(userLocation)
    self.providers()
      .forEach((p) => {
        const infoWindow = createInfoWindow(p, self.buildInfoWindowMarkup)
        createMarker(p, infoWindow)
      })

    if (navigator.geolocation) {
      createCurrPosMarker()
    }
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

  getApi.data(apiRoutes.needCategories)
    .then((needCategories) => {
      self.allNeedCategories(needCategories.data)
    })
}

module.exports = OfferItemModel
