/* global google */

const htmlEncode = require('htmlencode')
const ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!

const apiRoutes = require('../api')
const getApi = require('../get-api-data')
const listToDropdown = require('../list-to-dropdown')

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

  const createInfoWindow = function (provider, buildMarkup) {
    const infoWindow = new google.maps.InfoWindow({
      content: buildMarkup(provider)
    })

    self.infoWindows.push(infoWindow)
    return infoWindow
  }

  const createMarker = function (provider, infoWindow) {
    const marker = new google.maps.Marker({
      position: { lat: provider.addresses[0].latitude, lng: provider.addresses[0].longitude },
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

  self.displayMap = (providers, userLocation) => {
    self.map = self.buildMap(userLocation)

    providers
      .filter((p) => p.addresses.length > 0)
      .forEach((p) => {
        const infoWindow = createInfoWindow(p, self.buildInfoWindowMarkup)
        createMarker(p, infoWindow)
      })

    if (navigator.geolocation) {
      createCurrPosMarker()
    }
  }

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

  const getUniqueNeedCategories = function (providers) {
    const availableCats = providers
      .map((p) => p.needCategories)
      .reduce((acc, cats) => {
        return [...acc, ...cats]
      }, [])
    return [...new Set(availableCats)]
  }

  const createCats = function (needCategories, uniqueAvailableCats) {
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
    return cats
  }

  self.buildCatsFilter = (providers, needCategories) => {
    const uniqueAvailableCats = getUniqueNeedCategories(providers)
    const cats = createCats(needCategories, uniqueAvailableCats)
    self.showFilter(cats.length > 1)
    self.needCategories(cats)
    listToDropdown.init(initSubCatAsDropdown)
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
