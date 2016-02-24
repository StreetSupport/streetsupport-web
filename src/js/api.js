var dev = 'http://localhost:55881' // eslint-disable-line
var staging = 'https://streetsupport-api-staging.apphb.com' // eslint-disable-line
var live = 'https://streetsupport-api.apphb.com' // eslint-disable-line

var env = require('./env')

var envs = [dev, staging, live]

var domainRoot = envs[env]

var serviceProvidersUrl = '/v2/service-providers/'
var serviceCategoriesUrl = '/v2/service-categories/'
var categoryServiceProvidersUrl = '/v2/categorised-service-providers/show/'
var categoryServiceProvidersByDayUrl = '/v2/timetabled-service-providers/show/'
var organisationUrl = '/v2/service-providers/show/'
var needsUrl = '/v1/service-provider-needs/'
var volunteerEnquiryUrl = '/v1/volunteer-enquiries'

module.exports = {
  serviceProviders: domainRoot + serviceProvidersUrl,
  serviceCategories: domainRoot + serviceCategoriesUrl,
  categoryServiceProviders: domainRoot + categoryServiceProvidersUrl,
  categoryServiceProvidersByDay: domainRoot + categoryServiceProvidersByDayUrl,
  organisation: domainRoot + organisationUrl,
  needs: domainRoot + needsUrl,
  createVolunteerEnquiry: domainRoot + volunteerEnquiryUrl
}
