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
var offerToHelpUrl = '/v1/offers-to-help/'
var joinStreetSupportApplicationsUrl = '/v1/join-street-support-applications/'

module.exports = {
  serviceProviders: domainRoot + serviceProvidersUrl,
  allServiceProviders: domainRoot + allServiceProvidersUrl,
  serviceCategories: domainRoot + serviceCategoriesUrl,
  categoryServiceProviders: domainRoot + categoryServiceProvidersUrl,
  categoryServiceProvidersByDay: domainRoot + categoryServiceProvidersByDayUrl,
  organisation: domainRoot + organisationUrl,
  needs: domainRoot + needsUrl,
  createVolunteerEnquiry: domainRoot + volunteerEnquiryUrl,
  createOfferToHelp: domainRoot + offerToHelpUrl,
  joinStreetSupportApplications: domainRoot + joinStreetSupportApplicationsUrl
}
