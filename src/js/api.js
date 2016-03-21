var local = 'http://localhost:55881' // eslint-disable-line
var dev = 'http://streetsupport-api-ci.apphb.com' // eslint-disable-line
var staging = 'https://streetsupport-api-staging.apphb.com' // eslint-disable-line
var live = 'https://streetsupport-api.apphb.com' // eslint-disable-line

var env = require('./env')

var envs = [local, dev, staging, live]

var domainRoot = envs[env]

var serviceProvidersUrl = '/v2/service-providers/'
var serviceCategoriesUrl = '/v2/service-categories/'
var categoryServiceProvidersUrl = '/v2/categorised-service-providers/show/'
var categoryServiceProvidersByDayUrl = '/v2/timetabled-service-providers/show/'
var organisationUrl = '/v2/service-providers/show/'
var needsUrl = '/v1/service-provider-needs/'
var allServiceProvidersUrl = '/v1/all-service-providers/'
var volunteerEnquiryUrl = '/v1/volunteer-enquiries/'
var joinStreetSupportApplicationsUrl = '/v1/join-street-support-applications/'
var offerSponsorshipUrl = '/v1/sponsorship-offers/'

var p = function (url) {
  return domainRoot + url
}

module.exports = {
  serviceProviders: p(serviceProvidersUrl),
  allServiceProviders: p(allServiceProvidersUrl),
  serviceCategories: p(serviceCategoriesUrl),
  categoryServiceProviders: p(categoryServiceProvidersUrl),
  categoryServiceProvidersByDay: p(categoryServiceProvidersByDayUrl),
  organisation: p(organisationUrl),
  needs: p(needsUrl),
  createVolunteerEnquiry: p(volunteerEnquiryUrl),
  joinStreetSupportApplications: p(joinStreetSupportApplicationsUrl),
  offerSponsorship: p(offerSponsorshipUrl)
}
