import ko from 'knockout'
import { htmlDecode } from 'htmlencode'

require('../../arrayExtensions')

const ajax = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const location = require('../../location/locationSelector')
const proximityRanges = require('../../location/proximityRanges')
const getDistanceApart = require('../../location/getDistanceApart')

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

function OrgListing (orgsFilter = null, pageSize = 8) {
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
  self.hasMorePages = ko.computed(() => self.pageIndex() < self.organisations().length, self)
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
    paginate()
  }

  const sortAlphabetical = function (a, b) {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  }

  const sortByDistanceAway = function (a, b) {
    if (a.distanceInMetres < b.distanceInMetres) return -1
    if (a.distanceInMetres > b.distanceInMetres) return 1
    return 0
  }

  self.sortAToZ = function () {
    self.organisations(self.organisations().sort(sortAlphabetical))
    self.currentSort('atoz')
    paginate()
  }

  self.sortNearest = function () {
    self.organisations(self.organisations().sort(sortByDistanceAway))
    self.currentSort('nearest')
    paginate()
  }

  self.search = function () {
    const keyContainsQuery = (o) => o.name.toLowerCase().includes(self.searchQuery().toLowerCase())
    self.orgsToDisplay(self.organisations().filter(keyContainsQuery))
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
      (error) => {
        console.log({ error })
        self.postcodeRetrievalIssue(true)
      })
  }

  const groupByOrg = function (orgLocations, currLocation) {
    return orgLocations
      .reduce((acc, next) => {
        const { distanceInMetres, description } = getDistanceApart(
          { latA: next.latitude, longA: next.longitude },
          { latB: currLocation.latitude, longB: currLocation.longitude },
          'km'
        )
        next.distanceInMetres = distanceInMetres
        next.distanceDescription = description
        const existing = acc.find((o) => o.key === next.serviceProviderKey)
        if (existing) {
          existing.locations.push(next)
        } else {
          acc.push({
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
            ]
          })
        }
        return acc
      }, [])
  }

  const loadOrgsForLocation = function (location) {
    browser.loading()
    ajax
      .data(`${endpoints.serviceProviderLocations}?pageSize=1000&latitude=${location.latitude}&longitude=${location.longitude}&range=${self.range()}`)
      .then((result) => {
        const orgs = groupByOrg(result.data.items, location)
        orgs.forEach((o) => {
          const nearestOrgLocation = o.locations.sort(sortByDistanceAway)[0]
          o.distanceInMetres = nearestOrgLocation.distanceInMetres
          o.distanceDescription = nearestOrgLocation.distanceDescription
        })
        self.organisations(self.orgsFilter
          ? orgs.filter(self.orgsFilter)
          : orgs)
        self.sortNearest()
        paginate()
        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  const init = function (location) {
    self.postcode(location.postcode)

    loadOrgsForLocation(location)
  }

  location.getPreviouslySetPostcode()
    .then((result) => {
      init(result)
    }, (err) => {
      console.log(err)
      browser.redirect('/500')
    })
}

module.exports = OrgListing
