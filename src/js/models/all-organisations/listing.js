import ko from 'knockout'
import { htmlDecode } from 'htmlencode'

require('../../arrayExtensions')

const ajax = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const location = require('../../location/locationSelector')
const proximityRanges = require('../../location/proximityRanges')
const getDistanceApart = require('../../location/getDistanceApart')
const querystring = require('../../get-url-parameter')

class ClientGroupFilter {
  constructor (cgData, listener) {
    this.key = cgData.key
    this.name = cgData.name
    this.sortPosition = cgData.sortPosition
    this.listener = listener
    this.isSelected = ko.observable(false)
  }

  click () {
    this.isSelected(!this.isSelected())
    if (this.isSelected()) {
      this.listener.addClientGroupToFilter(this.key)
    } else {
      this.listener.removeClientGroupToFilter(this.key)
    }
  }
}

function OrgListing (orgsFilter = null, pageSize = 25) {
  const self = this

  self.orgsFilter = orgsFilter
  self.pageSize = pageSize
  self.pageIndex = ko.observable(self.pageSize)

  self.postcode = ko.observable()
  self.range = ko.observable(10000)
  self.ranges = ko.observableArray(proximityRanges.ranges)
  self.searchQuery = ko.observable()
  self.organisations = ko.observableArray()
  self.orgsToDisplay = ko.observableArray()
  self.totalItems = ko.observable()

  self.clientGroupFilters = ko.computed(() => {
    return self.organisations()
      .reduce((acc, nextOrg) => {
        nextOrg.clientGroups
          .forEach((nextCg) => {
            if (!acc.find((cg) => cg.key === nextCg.key)) {
              acc = [...acc, new ClientGroupFilter(nextCg, self)]
            }
          })
        return acc
      }, [])
      .sortDesc('sortPosition')
  }, self)
  self.hasClientGroupFilters = ko.computed(() => {
    return self.clientGroupFilters().length
  }, self)

  self.clientGroupFiltersApplied = []

  self.addClientGroupToFilter = (clientGroupKey) => {
    self.clientGroupFiltersApplied.push(clientGroupKey)
    paginate()
  }

  self.removeClientGroupToFilter = (clientGroupKey) => {
    self.clientGroupFiltersApplied = self.clientGroupFiltersApplied.filter((cgk) => cgk !== clientGroupKey)
    paginate()
  }

  self.currentSort = ko.observable()

  self.postcodeRetrievalIssue = ko.observable(false)

  self.hasOrgs = ko.computed(() => self.organisations().length > 0, self)
  self.hasPrevPages = ko.computed(() => self.pageIndex() > 0, self)
  self.hasMorePages = ko.computed(() => self.pageIndex() < self.totalItems(), self)
  self.isSortedAToZ = ko.computed(() => self.currentSort() === 'atoz', self)
  self.isSortedNearest = ko.computed(() => self.currentSort() === 'nearest', self)

  const paginate = function () {
    const servesAllClientGroupsRequested = (org) => {
      const intersection = self.clientGroupFiltersApplied.filter(x => org.clientGroupKeys.includes(x))
      return intersection.length === self.clientGroupFiltersApplied.length
    }
    const orgsToDisplay = self.organisations()
      .filter((o) => servesAllClientGroupsRequested(o))
      .slice(0, self.pageIndex())
    self.orgsToDisplay(orgsToDisplay)
  }

  self.prevPage = function () {
    self.pageIndex(self.pageIndex() - self.pageSize)
    paginate()
  }

  self.nextPage = function () {
    self.pageIndex(self.pageIndex() + self.pageSize)
    paginate()
  }

  self.loadMore = function () {
    self.pageIndex(self.pageIndex() + self.pageSize)
    location.getPreviouslySetPostcode()
      .then((result) => {
        init(result, true)
      }, () => {
        browser.redirect('/500')
      })
  }

  self.sortAToZ = function () {
    self.organisations(self.organisations().sortAsc('name'))
    self.currentSort('atoz')
    paginate()
  }

  self.sortNearest = function () {
    self.organisations(self.organisations().sortAsc('distanceInMetres'))
    self.currentSort('nearest')
    paginate()
  }

  self.search = function () {
    location.getPreviouslySetPostcode()
      .then((currentLocation) => {
        loadOrgsForName(self.searchQuery(), currentLocation)
      }, () => {
        browser.redirect('/500')
      })
  }

  self.getByPostcode = function () {
    location.setPostcode(
      self.postcode(),
      (newLocation) => {
        if (newLocation !== undefined) {
          self.postcodeRetrievalIssue(false)
          loadOrgsForLocation(newLocation)
        } else {
          self.postcodeRetrievalIssue(true)
        }
      },
      () => {
        self.postcodeRetrievalIssue(true)
      })
  }

  const groupByOrg = function (orgLocations, currLocation) {
    const mapOrg = (next) => {
      return {
        key: next.serviceProviderKey,
        name: htmlDecode(next.serviceProviderName),
        synopsis: htmlDecode(next.serviceProviderSynopsis),
        href: `/find-help/organisation?organisation=${next.serviceProviderKey}`,
        donationUrl: next.donationUrl,
        donationDescription: next.donationDescription,
        itemDonationDescription: next.itemDonationDescription,
        needCategories: next.needCategories,
        clientGroups: next.clientGroups,
        clientGroupKeys: next.clientGroups.map((cg) => cg.key),
        locations: [
          next
        ],
        distanceInMetres: 0,
        distanceDescription: ''
      }
    }

    const toSameServiceProviderKey = (acc, next) => {
      const existing = acc.find((o) => o.key === next.serviceProviderKey)
      if (existing) {
        existing.locations.push(next)
      } else {
        acc.push(mapOrg(next))
      }
      return acc
    }

    const setProximity = (o) => {
      const { distanceInMetres, description } = getDistanceApart(
        { latA: o.latitude, longA: o.longitude },
        { latB: currLocation.latitude, longB: currLocation.longitude },
        'km'
      )
      o.distanceInMetres = distanceInMetres
      o.distanceDescription = description
    }

    const setNearestLocation = (o) => {
      const nearestOrgLocation = o.locations.sortAsc('distanceInMetres')[0]
      o.distanceInMetres = nearestOrgLocation.distanceInMetres
      o.distanceDescription = nearestOrgLocation.distanceDescription
    }

    if (!currLocation) {
      return orgLocations
        .reduce(toSameServiceProviderKey, [])
    } else {
      orgLocations
        .forEach(setProximity)
      const orgs = orgLocations
        .reduce(toSameServiceProviderKey, [])
      orgs.forEach(setNearestLocation)
      return orgs
    }
  }

  const loadOrgsForName = function (name, currentLocation) {
    browser.loading()
    ajax
      .data(`${endpoints.serviceProviderLocations}?providerName=${name}`)
      .then((result) => {
        self.organisations(groupByOrg(result.data.items, currentLocation))
        paginate()
        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  const loadOrgsForLocation = function (location, isLoadMore = false) {
    browser.loading()
    if (isLoadMore !== true) {
      self.pageIndex(self.pageSize)
    }
    ajax
      .data(`${endpoints.serviceProviderLocations}?pageSize=${self.pageSize}&latitude=${location.latitude}&longitude=${location.longitude}&range=${self.range()}&index=${self.pageIndex() - self.pageSize}`)
      .then((result) => {
        self.totalItems(result.data.total)
        const orgs = groupByOrg(result.data.items, location)

        if (isLoadMore !== true) {
          self.organisations([])
        }

        self.organisations(self.organisations().concat(self.orgsFilter
          ? orgs.filter(self.orgsFilter)
          : orgs))
        self.sortNearest()
        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  const init = function (location, isLoadMore = false) {
    if (location) {
      self.postcode(location.postcode)
      loadOrgsForLocation(location, isLoadMore)
    }
  }

  const getPostCode = function () {
    const postcodeInQuerystring = querystring.parameter('postcode')

    if (postcodeInQuerystring) {
      self.postcode(postcodeInQuerystring)
      self.getByPostcode()
    } else {
      location.getPreviouslySetPostcode()
        .then((result) => {
          init(result, false)
        }, () => {
          browser.redirect('/500')
        })
    }
  }

  getPostCode()
}

module.exports = OrgListing
