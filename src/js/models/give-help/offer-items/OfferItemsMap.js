/* global google */

const htmlEncode = require('htmlencode')
const ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!

const apiRoutes = require('../../../api')
const getApi = require('../../../get-api-data')
const listToDropdown = require('../../../list-to-dropdown')
const googleMaps = require('../../../location/googleMaps')

var OfferItemModel = function () {
  var self = this
  self.allNeedCategories = ko.observableArray()
  self.providers = ko.observableArray()
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

  self.providers.subscribe(() => {
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

  const buildInfoWindowMarkup = function (provider) {
    return `<div class="card card--brand-h card--gmaps">
              <div class="card__title">
                <button class="card__close js-popup-close" title="close">&#10799;</button>
                <h1 class="h2"><a href="/find-help/organisation/?organisation=${provider.key}">${htmlEncode.htmlDecode(provider.name)}</a></h1>
                <p>${htmlEncode.htmlDecode(provider.itemDonationDescription)}</p>
              </div>
              <div class="card__details">
                <a href="/find-help/organisation/?organisation=${provider.key}">More information</a>
              </div>
            </div>`
  }

  const createMarker = function (provider) {
    let popup = null

    provider.locations
      .forEach((l) => {
        const marker = googleMaps.buildMarker(l, self.map,
          {
            title: `${htmlEncode.htmlDecode(provider.name)}`
          }
        )
        marker.categories = provider.needCategories

        marker.addListener('click', function () {
          document.querySelectorAll('.card__gmaps-container')
            .forEach((p) => p.parentNode.removeChild(p))
          popup = new googleMaps.Popup(
            this.position.lat(),
            this.position.lng(),
            buildInfoWindowMarkup(provider))
          popup.setMap(self.map)
          self.map.setCenter(new google.maps.LatLng(this.position.lat(), this.position.lng()))
        })

        self.markers.push(marker)
      })
  }

  self.displayMap = (userLocation) => {
    self.map = googleMaps.buildMap(userLocation, 11)
    self.providers()
      .forEach((p) => {
        createMarker(p)
      })
    googleMaps.addCircleMarker(userLocation, self.map)
  }

  self.filter = (c) => {
    document.querySelectorAll('.card__gmaps-container')
      .forEach((p) => p.parentNode.removeChild(p))
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
